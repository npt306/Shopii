import { Injectable, HttpException, HttpStatus, UnauthorizedException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as jwt from 'jsonwebtoken';
import { HttpService } from '@nestjs/axios';
import { UserDto } from 'src/DTO/user.dto';
import { firstValueFrom } from 'rxjs';
import { User } from 'src/ENTITY/user.entity';

@Injectable()
export class UsersService {
  private keycloakBaseUrl = process.env.KEYCLOAK_BASE_URL || 'http://localhost:8080';
  private realm = process.env.KEYCLOAK_REALM || 'shopii';
  private adminUsername = process.env.KEYCLOAK_ADMIN_USERNAME || 'admin';
  private adminPassword = process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin';
  private adminClientId = process.env.KEYCLOAK_ADMIN_CLIENT_ID || 'admin-cli';
  private clientId = process.env.KEYCLOAK_CLIENT_ID || 'your-client-id';
  private clientSecret = process.env.KEYCLOAK_CLIENT_SECRET || '';

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

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

    // Save additional user information into PostgreSQL
    const userRecord = this.userRepository.create({
      email: userDto.email,
      username: userDto.username,
      avatar: userDto.avatar || '', // Default to empty string if not provided
      date_of_birth: userDto.date_of_birth ? new Date(userDto.date_of_birth) : undefined,
      phoneNumber: userDto.phoneNumber,
      address: userDto.address,
      sex: userDto.sex,
      status: userDto.status || 'active', // Default status if not provided
    });
    await this.userRepository.save(userRecord);

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
  
  // New method: automatically exchange standard token for an RPT
  async loginAndExchange(username: string, password: string, permissions: string[]): Promise<any> {
    // Get the standard access token via login
    const tokenData = await this.login(username, password);
    const standardAccessToken = tokenData.access_token;

    const decoded = jwt.decode(standardAccessToken) as any;
    if (!decoded.email_verified) {
      throw new UnauthorizedException('Email is not verified.');
    }
    
    // Automatically request an RPT token with the required permissions.
    const rptData = await this.getRequestingPartyToken(standardAccessToken);
    
    // Return both tokens and other relevant data.
    return {
      standardAccessToken,
      rptAccessToken: rptData.access_token,
      rptPermissions: rptData.authorization?.permissions,
      expires_in: rptData.expires_in,
      refresh_token: tokenData.refresh_token,
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
    const redirectUri = 'http://localhost:3000'; // Adjust accordingly
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
      console.log("hello")
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
  
    console.log('About to request role');
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
}
