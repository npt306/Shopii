import { Injectable, HttpException, HttpStatus, UnauthorizedException, Logger} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';
import { HttpService } from '@nestjs/axios';
import { UserDto } from 'src/dto/user.dto';
import { firstValueFrom } from 'rxjs';
import { Account } from 'src/entity/Account.entity';
import { User } from 'src/entity/User.entity';
import { Seller } from 'src/entity/seller.entity';
import axios from 'axios';

@Injectable()
export class UsersService {
  private keycloakBaseUrl = process.env.KEYCLOAK_BASE_URL;
  private realm = process.env.KEYCLOAK_REALM || 'shopii';
  private adminUsername = process.env.KEYCLOAK_ADMIN_USERNAME || 'admin';
  private adminPassword = process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin';
  private adminClientId = process.env.KEYCLOAK_ADMIN_CLIENT_ID || 'admin-cli';
  private clientId = process.env.KEYCLOAK_CLIENT_ID || 'your-client-id';
  private clientSecret = process.env.KEYCLOAK_CLIENT_SECRET || '';
  private redirectGateway = process.env.REDIRECT_GATEWAY;

  constructor(
    private readonly httpService: HttpService,
    
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
  ) {
  }

  async getAdminToken(): Promise<string> {
    const url = `${this.keycloakBaseUrl}/realms/master/protocol/openid-connect/token`;
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('client_id', this.adminClientId);
    params.append('username', this.adminUsername);
    params.append('password', this.adminPassword);

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, params.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );
      return response.data.access_token;
    } catch (error) {
      throw new HttpException('Failed to obtain admin token', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async register(userDto: UserDto): Promise<any> {
    const adminToken = await this.getAdminToken();
    const createUserUrl = `${this.keycloakBaseUrl}/admin/realms/${this.realm}/users`;

    // Prepare payload for Keycloak registration
    const userPayload = {
      username: userDto.username,
      email: userDto.email,
      firstName: userDto.firstName,
      lastName: userDto.lastName,
      enabled: true,
      attributes: {
        phoneNumber: userDto.phoneNumber,
      },
      credentials: [
        {
          type: 'password',
          value: userDto.password,
          temporary: false,
        },
      ],
    };

    try {
      await firstValueFrom(
        this.httpService.post(createUserUrl, userPayload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
        }),
      );
    } catch (error) {
      console.log(error);
      throw new HttpException('User registration failed', HttpStatus.BAD_REQUEST);
    }

    // Retrieve the created user from Keycloak to get the user ID
    const searchUrl = `${this.keycloakBaseUrl}/admin/realms/${this.realm}/users?email=${userDto.email}`;
    const searchResponse = await firstValueFrom(
      this.httpService.get(searchUrl, {
        headers: { Authorization: `Bearer ${adminToken}` },
      }),
    );
    if (!searchResponse.data || searchResponse.data.length === 0) {
      throw new HttpException('User not found after registration', HttpStatus.BAD_REQUEST);
    }
    const createdUser = searchResponse.data[0];
    const userId = createdUser.id;

    // Determine roles to assign (default to ['buyer'] if not provided)
    const rolesToAssign: string[] = userDto.roles && userDto.roles.length > 0 ? userDto.roles : ['buyer'];

    // Loop through each role and assign to user in Keycloak
    for (const roleName of rolesToAssign) {
      const roleUrl = `${this.keycloakBaseUrl}/admin/realms/${this.realm}/roles/${roleName}`;
      let roleResponse;
      try {
        roleResponse = await firstValueFrom(
          this.httpService.get(roleUrl, {
            headers: { Authorization: `Bearer ${adminToken}` },
          }),
        );
      } catch (error) {
        throw new HttpException(`Role ${roleName} not found in Keycloak`, HttpStatus.BAD_REQUEST);
      }
      const roleRepresentation = roleResponse.data;

      const mappingUrl = `${this.keycloakBaseUrl}/admin/realms/${this.realm}/users/${userId}/role-mappings/realm`;
      try {
        await firstValueFrom(
          this.httpService.post(mappingUrl, [roleRepresentation], {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${adminToken}`,
            },
          }),
        );
      } catch (error) {
        throw new HttpException(`Failed to assign role ${roleName}`, HttpStatus.BAD_REQUEST);
      }
    }

    // Trigger the email verification
    await this.triggerVerificationEmail(userId);

    // Save additional user information into Accounts table
    const accountRecord = this.accountRepository.create({
      Email: userDto.email,
      Username: userDto.username,
      Avatar: userDto.avatar || undefined, 
      DoB: userDto.date_of_birth ? new Date(userDto.date_of_birth) : undefined,
      PhoneNumber: userDto.phoneNumber,
      Sex: userDto.sex,
      Status: userDto.status || 'active',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    });
    const savedAccount = await this.accountRepository.save(accountRecord);

    const user = new User();
    user.account = savedAccount;
    user.CreatedAt = new Date();
    user.UpdatedAt = new Date();
    await this.usersRepository.save(user);

    return { 
      message: `User registered successfully and assigned roles: ${rolesToAssign.join(', ')}`,
      userId,
    };
  }
  

  async login(username: string, password: string): Promise<any> {
    const url = `${this.keycloakBaseUrl}/realms/${this.realm}/protocol/openid-connect/token`;
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('client_id', this.clientId);
    if (this.clientSecret) {
      params.append('client_secret', this.clientSecret);
    } else {
      throw new HttpException('Client secret is not defined', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    params.append('username', username);
    params.append('password', password);
  
    try {
      const response = await firstValueFrom(
        this.httpService.post(url, params.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
  }
  

  async loginAndExchange(username: string, password: string, permissions: string[]): Promise<any> {
    // Get the standard access token via login
    const tokenData = await this.login(username, password);
    const standardAccessToken = tokenData.access_token;

    const decoded = jwt.decode(standardAccessToken) as any;
    if (!decoded.email_verified) {
      throw new UnauthorizedException('Email is not verified.');
    }
    
    // Fetch the user profile using the email from the decoded token
    const userProfile = await this.fetchProfileByEmail(decoded.email);
    
    // Automatically request an RPT token with the required permissions.
    const rptData = await this.getRequestingPartyToken(standardAccessToken);
    
    // Return both tokens, profile data, and other relevant information
    return {
      standardAccessToken,
      rptAccessToken: rptData.access_token,
      rptPermissions: rptData.authorization?.permissions,
      expires_in: rptData.expires_in,
      refresh_token: tokenData.refresh_token,
      profile: userProfile
    };
  }

  async refreshToken(refreshToken: string): Promise<any> {
    const url = `${this.keycloakBaseUrl}/realms/${this.realm}/protocol/openid-connect/token`;
    const params = new URLSearchParams();
    params.append('grant_type', 'refresh_token');
    params.append('client_id', this.clientId);
    if (this.clientSecret) {
      params.append('client_secret', this.clientSecret);
    } else {
      throw new HttpException('Client secret is not defined', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    params.append('refresh_token', refreshToken);
  
    try {
      // First, get a new standard token using the refresh token.
      const response = await firstValueFrom(
        this.httpService.post(url, params.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );
      const tokenData = response.data;
      const standardAccessToken = tokenData.access_token;
      
      // Automatically request an RPT token with the required permission(s)
      // Here, we're requesting "User Management#view". Adjust as needed.
      const rptData = await this.getRequestingPartyToken(standardAccessToken);
      
      // Return both tokens and related details.
      return {
        standardAccessToken,
        rptAccessToken: rptData.access_token,
        rptPermissions: rptData.authorization?.permissions,
        expires_in: rptData.expires_in,
        refresh_token: tokenData.refresh_token,
      };
    } catch (error: any) {
      console.error('Refresh token error:', error.response?.data || error.message);
      throw new HttpException('Failed to refresh token', HttpStatus.UNAUTHORIZED);
    }
  }

  async triggerVerificationEmail(userId: string): Promise<void> {
    const adminToken = await this.getAdminToken();
    const clientId = this.clientId;
    const redirectUri = `http://${this.redirectGateway}:3003`; // Adjust accordingly
    const executeActionsUrl = `${this.keycloakBaseUrl}/admin/realms/${this.realm}/users/${userId}/execute-actions-email?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  
    try {
      await firstValueFrom(
        this.httpService.put(
          executeActionsUrl,
          ["VERIFY_EMAIL"],
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${adminToken}`,
            },
          }
        )
      );
    } catch (error) {
      console.log('Error triggering verification email:', error.response ? error.response.data : error);
      throw new HttpException('Failed to trigger email verification', HttpStatus.BAD_REQUEST);
    }
  }

  async getEntitlement(userAccessToken: string): Promise<any> {
    const url = `${this.keycloakBaseUrl}/realms/${this.realm}/protocol/openid-connect/token/entitlement/${this.clientId}`;
    try {
      const response = await firstValueFrom(
        this.httpService.post(url, null, {  // No body is required
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userAccessToken}`,
          },
        }),
      );
      return response.data; // Expecting an object with a "permissions" field
    } catch (error: any) {
      console.error('Error fetching entitlement:', error.response?.data || error.message);
      throw new HttpException('Failed to fetch permissions', HttpStatus.UNAUTHORIZED);
    }
  }
  
  async getRequestingPartyToken(userAccessToken: string): Promise<any> {
    const url = `${this.keycloakBaseUrl}/realms/${this.realm}/protocol/openid-connect/token`;
    const params = new URLSearchParams();
    params.append('grant_type', 'urn:ietf:params:oauth:grant-type:uma-ticket');
    params.append('client_id', this.clientId);
    if (this.clientSecret) {
      params.append('client_secret', this.clientSecret);
    } else {
      throw new HttpException('Client secret is not defined', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    params.append('audience', this.clientId);
    // Note: Do NOT append any explicit 'permission' parameter.
    
    try {
      const response = await firstValueFrom(
        this.httpService.post(url, params.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Bearer ${userAccessToken}`,
          },
        }),
      );
      return response.data;
    } catch (error: any) {
      console.error('Error obtaining RPT:', error.response?.data || error.message);
      throw new HttpException('Failed to obtain RPT', HttpStatus.UNAUTHORIZED);
    }
  }

  async addSellerRole(userId: string): Promise<any> {
    const adminToken = await this.getAdminToken();
    const roleName = 'seller'; 

    // Get the seller role representation from Keycloak
    const roleUrl = `${this.keycloakBaseUrl}/admin/realms/${this.realm}/roles/${roleName}`;
    let roleResponse;
    try {
      roleResponse = await firstValueFrom(
        this.httpService.get(roleUrl, {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
      );
    } catch (error) {
      throw new HttpException(`Role ${roleName} not found in Keycloak`, HttpStatus.BAD_REQUEST);
    }
    const roleRepresentation = roleResponse.data;
    
    // Map the role to the user
    const mappingUrl = `${this.keycloakBaseUrl}/admin/realms/${this.realm}/users/${userId}/role-mappings/realm`;
    try {
      await firstValueFrom(
        this.httpService.post(mappingUrl, [roleRepresentation], {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
        }),
      );
    } catch (error) {
      throw new HttpException(`Failed to assign role ${roleName} to user`, HttpStatus.BAD_REQUEST);
    }
    
    return { message: `Role ${roleName} assigned successfully to user ${userId}` };
  }

  async createOrUpdateSeller(sellerDto: Partial<Seller> & { Email: string | string[] }): Promise<any> {
    // Ensure sellerDto includes an email.
    if (!sellerDto.Email) {
      throw new HttpException('Seller email is required', HttpStatus.BAD_REQUEST);
    }
    
    // If the email is an array, use its first element.
    const email: string = Array.isArray(sellerDto.Email) ? sellerDto.Email[0] : sellerDto.Email;
    
    // Find the account by email (assuming the Account entity column is "Email")
    const account = await this.accountRepository.findOne({ where: { Email: email } });
    if (!account) {
      throw new HttpException('Account not found for the provided email', HttpStatus.BAD_REQUEST);
    }
    
    // Use the Account's primary key (AccountId) as the seller's id.
    const sellerId = account.AccountId;
    
    // Try to find an existing seller record by the sellerId.
    let seller = await this.sellerRepository.findOne({ where: { id: sellerId } });
    
    // Convert the email into a one-element array (to be stored in the Seller's Email column).
    const emailArray = [email];
    
    if (seller) {
      // Merge new data into the existing seller record.
      seller = this.sellerRepository.merge(seller, { ...sellerDto, Email: emailArray, UpdatedAt: new Date() });
      await this.sellerRepository.save(seller);
    } else {
      // Create a new seller record using the account's ID and the email as an array.
      seller = this.sellerRepository.create({ ...sellerDto, id: sellerId, Email: emailArray, CreatedAt: new Date(), UpdatedAt: new Date() });
      await this.sellerRepository.save(seller);
    }

    // Find the user in Keycloak by email
    const adminToken = await this.getAdminToken();
    const searchUrl = `${this.keycloakBaseUrl}/admin/realms/${this.realm}/users?email=${email}`;
    const searchResponse = await firstValueFrom(
      this.httpService.get(searchUrl, {
        headers: { Authorization: `Bearer ${adminToken}` },
      }),
    );
    if (!searchResponse.data || searchResponse.data.length === 0) {
      throw new HttpException('User not found in Keycloak', HttpStatus.BAD_REQUEST);
    }
    const keycloakUser = searchResponse.data[0];
    const userId = keycloakUser.id;

    // Add the seller role to the user in Keycloak
    await this.addSellerRole(userId);

    return { message: seller ? 'Seller updated successfully' : 'Seller created successfully', seller };
  }

  async fetchProfileByEmail(email: string): Promise<any> {
    try {
      // Find account by email
      const account = await this.accountRepository.findOne({ 
        where: { Email: email } 
      });
      
      if (!account) {
        throw new HttpException('User profile not found', HttpStatus.NOT_FOUND);
      }
      
      // Find user data associated with account
      const user = await this.usersRepository.findOne({
        where: { account: { AccountId: account.AccountId } }
      });

      // Check if user is also a seller
      const seller = await this.sellerRepository.findOne({
        where: { id: account.AccountId }
      });

      // Generate comprehensive profile object
      const profile = {
        accountId: account.AccountId,
        email: account.Email,
        username: account.Username,
        avatar: account.Avatar,
        dateOfBirth: account.DoB,
        phoneNumber: account.PhoneNumber,
        sex: account.Sex,
        status: account.Status,
        createdAt: account.CreatedAt,
        updatedAt: account.UpdatedAt,
        isSeller: !!seller,
        sellerInfo: seller || null,
        userInfo: user || null
      };

      return profile;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      Logger.error(`Failed to fetch profile: ${error.message}`, 'UsersService');
      throw new HttpException('Error fetching user profile', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  async exchangeCodeForTokens(code: string) {
    try {
      const tokenEndpoint = 'https://sso-shopii.ddns.net/realms/shopii/protocol/openid-connect/token';
      
      // Make sure the redirect_uri matches EXACTLY what was used in the initial request
      const params = new URLSearchParams();
      params.append('grant_type', 'authorization_code');
      params.append('code', code);
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
      params.append('redirect_uri', `http://${this.redirectGateway}:8000/callback`);
      
      console.log("Sending token request with params:", params.toString());
      
      const response = await axios.post(tokenEndpoint, params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      return response.data;
    } catch (error) {
      // Enhanced error logging
      console.error('Token exchange error details:', error.response?.data);
      console.error('Full error:', error);
      
      if (error.response?.data?.error === 'invalid_grant' && 
          error.response?.data?.error_description === 'Code not valid') {
        throw new Error('Authentication code expired or already used. Please try logging in again.');
      }
      
      throw error;
    }
  }

  async getUserInfo(accessToken: string): Promise<any> {
    try {
      const userInfoEndpoint = `${this.keycloakBaseUrl}/realms/${this.realm}/protocol/openid-connect/userinfo`;
      console.log(`Fetching user info from: ${userInfoEndpoint}`);
      
      const response = await firstValueFrom(
        this.httpService.get(userInfoEndpoint, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
      );
      
      console.log("User info fetched successfully");
      return response.data;
    } catch (error) {
      console.error('Error fetching user info:', error.response?.data || error.message);
      throw new Error(`Failed to fetch user info: ${error.message}`);
    }
  }

  async createUserSession(userInfo: any, tokens: any): Promise<any> {
    try {
      // Find account by email (if user already exists)
      let account = await this.accountRepository.findOne({ where: { Email: userInfo.email } });
      
      if (!account) {
        // Create new account if not found
        account = this.accountRepository.create({
          Email: userInfo.email,
          Username: userInfo.preferred_username || userInfo.email,
          Avatar: userInfo.picture || undefined,
          PhoneNumber: userInfo.phone_number,
          Status: 'active',
          CreatedAt: new Date(),
          UpdatedAt: new Date(),
        });
        await this.accountRepository.save(account);
        
        // Create user record linked to the account
        const user = new User();
        user.account = account;
        user.CreatedAt = new Date();
        user.UpdatedAt = new Date();
        await this.usersRepository.save(user);
      }
      
      // Return user session data
      return {
        id: account.AccountId,
        username: account.Username,
        email: account.Email,
        tokens: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_in: tokens.expires_in
        }
      };
    } catch (error) {
      console.error('Error creating user session:', error);
      throw new Error(`Failed to create user session: ${error.message}`);
    }
  }

  async sendEmailVerification(email: string): Promise<string> {
    const adminToken = await this.getAdminToken();
    const createUserUrl = `${this.keycloakBaseUrl}/admin/realms/${this.realm}/users`;

    // Create a temporary user in Keycloak with minimal information
    const userPayload = {
      username: email, // Use email as username for temporary user
      email: email,
      enabled: true, // Enable the user to receive emails
      emailVerified: false, // Not verified yet
      credentials: [
        {
          type: 'password',
          value: Math.random().toString(36).slice(-8), // Generate random password
          temporary: true, // Mark as temporary
        },
      ],
    };

    try {
      // Create the user
      await firstValueFrom(
        this.httpService.post(createUserUrl, userPayload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
        }),
      );

      // Find the created user to get the ID
      const searchUrl = `${this.keycloakBaseUrl}/admin/realms/${this.realm}/users?email=${email}`;
      const searchResponse = await firstValueFrom(
        this.httpService.get(searchUrl, {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
      );
      
      if (!searchResponse.data || searchResponse.data.length === 0) {
        throw new HttpException('User not found after creation', HttpStatus.BAD_REQUEST);
      }
      
      const userId = searchResponse.data[0].id;

      // Send verification email
      const executeActionsUrl = `${this.keycloakBaseUrl}/admin/realms/${this.realm}/users/${userId}/execute-actions-email`;
      
      await firstValueFrom(
        this.httpService.put(
          executeActionsUrl,
          ['VERIFY_EMAIL'],
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${adminToken}`,
            },
          }
        )
      );

      return userId;
    } catch (error) {
      console.error('Error creating temporary user or sending verification:', error.response?.data || error.message);
      throw new HttpException('Failed to send email verification', HttpStatus.BAD_REQUEST);
    }
  }

  async checkEmailVerification(email: string): Promise<boolean> {
    try {
      const adminToken = await this.getAdminToken();
      
      // Find the user by email
      const searchUrl = `${this.keycloakBaseUrl}/admin/realms/${this.realm}/users?email=${email}`;
      const searchResponse = await firstValueFrom(
        this.httpService.get(searchUrl, {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
      );
      
      if (!searchResponse.data || searchResponse.data.length === 0) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      
      const user = searchResponse.data[0];
      return user.emailVerified === true;
    } catch (error) {
      console.error('Error checking email verification status:', error.response?.data || error.message);
      throw new HttpException('Failed to check email verification status', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
