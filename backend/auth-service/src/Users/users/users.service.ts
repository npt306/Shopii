import { Injectable, HttpException, HttpStatus, UnauthorizedException, Logger } from '@nestjs/common';
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
import { MinimalRegisterDto } from 'src/dto/register.dto';

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
  //FOR TESTING LOCAL
  // public client_gateway = "http://localhost:3003";
  // public server_gateway = "http://localhost:8000";
  // public domain = "localhost"
  //FOR DEPLOYED
  public domain = "34.58.241.34"
  public client_gateway = "http://34.58.241.34";
  public server_gateway = "http://34.58.241.34";

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

  async register(userDto: MinimalRegisterDto): Promise<any> {
    const adminToken = await this.getAdminToken();
    const createUserUrl = `${this.keycloakBaseUrl}/admin/realms/${this.realm}/users`;
  
    // Generate default values using only the provided email
    const defaultUsername = userDto.email.split('@')[0];
    const defaultPassword = userDto.password;
    const defaultFirstName = 'User';
    const defaultLastName = 'Account';
  
    // Prepare payload for Keycloak registration with defaults
    const userPayload = {
      username: defaultUsername,
      email: userDto.email,
      firstName: defaultFirstName,
      lastName: defaultLastName,
      enabled: true,
      attributes: {
        phoneNumber: 'N/A',
      },
      credentials: [
        {
          type: 'password',
          value: defaultPassword,
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
    const rolesToAssign: string[] = ['buyer'];
  
    // Assign each role to the user in Keycloak
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
  
    // Generate the Account record using only the provided email and defaults
    const generatedAvatar = null;
    const defaultDoB = new Date('1900-01-01'); // Default birth date if not provided
    const accountRecord = this.accountRepository.create({
      Email: userDto.email,
      Username: defaultUsername,
      Avatar: undefined,
      DoB: defaultDoB,
      PhoneNumber: 'N/A',
      Sex: false,
      Status: 'active',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    });
    const savedAccount = await this.accountRepository.save(accountRecord);
  
    // Save additional user information into the Users table
    const user = new User();
    user.account = savedAccount;
    user.CreatedAt = new Date();
    user.UpdatedAt = new Date();
    await this.usersRepository.save(user);
  
    // Now trigger the email verification
    await this.triggerVerificationEmail(userId);
  
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
      console.log(error);
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
    const redirectUri = `http://34.58.241.34:8000/login`; // Adjust accordingly
    // const redirectUri = `http://localhost:8000/login`; // Adjust accordingly
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

  async createOrUpdateSeller(data: any, userAccessToken: string): Promise<any> {
    // Extract relevant information from nested structure
    let email: string;
    let shopName: string;
    let taxCode: number = 0;
    let sellerType: string = 'Individual';
    let emailArray: string[] = [];
  
    // Handle nested data structure from frontend
    if (data.shopInformation || data.taxRegister) {
      const shopEmail = data.shopInformation?.email;
      const taxEmail = data.taxRegister?.email;
  
      // Use shop email for primary account lookup, but fall back to tax email if not available
      email = shopEmail || taxEmail;
      
      // Track both emails when they differ
      emailArray = [];
      if (shopEmail) emailArray.push(shopEmail);
      if (taxEmail && taxEmail !== shopEmail) emailArray.push(taxEmail);
  
      // If we have at least one email in the array, use it, otherwise create an array with the primary email
      if (emailArray.length === 0 && email) {
        emailArray = [email];
      }
  
      shopName = data.shopInformation?.shopName;
  
      // Parse tax code as number or default to 0
      if (data.taxRegister?.taxCode) {
        taxCode = parseInt(data.taxRegister.taxCode, 10) || 0;
      }
  
      // Map business type to seller type
      if (data.taxRegister?.businessType) {
        switch (data.taxRegister.businessType) {
          case 'ho-kinh-doanh':
            sellerType = 'Small Business';
            break;
          case 'cong-ty':
            sellerType = 'Company';
            break;
          default:
            sellerType = 'Individual';
        }
      }
    } else {
      // Support original format for backward compatibility
      email = Array.isArray(data.Email) ? data.Email[0] : data.Email;
      shopName = data.ShopName;
      taxCode = data.TaxCode || 0;
      sellerType = data.SellerType || 'Individual';
    }
  
    // Validate required data
    if (!email) {
      throw new HttpException('Seller email is required', HttpStatus.BAD_REQUEST);
    }
  
    if (!shopName) {
      throw new HttpException('Shop name is required', HttpStatus.BAD_REQUEST);
    }
  
    // Find the account by email
    const account = await this.accountRepository.findOne({ where: { Email: email } });
    if (!account) {
      throw new HttpException('Account not found for the provided email', HttpStatus.BAD_REQUEST);
    }
  
    // Use the Account's primary key (AccountId) as the seller's id
    const sellerId = account.AccountId;
  
    // Prepare valid seller data
    const validSellerData: Partial<Seller> = {
      ShopName: shopName,
      TaxCode: taxCode,
      SellerType: sellerType,
      Followers: 0,
    };
  
    // Find existing seller or create new one
    let seller = await this.sellerRepository.findOne({ where: { id: sellerId } });
  
    if (seller) {
      // Update existing seller
      seller = this.sellerRepository.merge(seller, {
        ...validSellerData,
        Email: emailArray,
        UpdatedAt: new Date()
      });
      await this.sellerRepository.save(seller);
    } else {
      // Create new seller
      seller = this.sellerRepository.create({
        ...validSellerData,
        id: sellerId,
        Email: emailArray,
        CreatedAt: new Date(),
        UpdatedAt: new Date()
      });
      await this.sellerRepository.save(seller);
    }
  
    // Get user information from token rather than searching by email
    try {
      // Decode the token to get user info
      const decoded = jwt.decode(userAccessToken) as any;
      const userId = decoded.sub; // Subject claim contains the user ID
  
      // Add the seller role to the user in Keycloak using admin token
      // We still need admin token for role assignment
      await this.addSellerRole(userId);
      
      return {
        message: seller ? 'Seller updated successfully' : 'Seller created successfully',
        seller
      };
    } catch (error) {
      console.error('Error processing token:', error);
      throw new HttpException('Failed to process user token', HttpStatus.BAD_REQUEST);
    }
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
