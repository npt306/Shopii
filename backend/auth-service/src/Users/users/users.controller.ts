import { Controller, Post, Body, Get, Delete, UseGuards, HttpException, HttpStatus, Req, UnauthorizedException, HttpCode, Query, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { Permissions } from 'src/guards/permission.decorator';
import { PermissionsGuard } from 'src/guards/permission.guard';
import { UserDto } from 'src/dto/user.dto';
import { UsersService } from './users.service';
import { env } from 'process';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { MinimalRegisterDto } from 'src/dto/register.dto';
import { IsNotEmpty, IsString } from 'class-validator';
import { EnvValue } from 'src/environment-value/env-value';

export class AdminLoginDto {
  username: string;
  password: string;
  otpCode?: string;
}

export class AdminOtpVerifyDto {
  @IsString()
  @IsNotEmpty()
  tempToken: string;

  @IsString()
  @IsNotEmpty()
  otpCode: string;
}


@Controller('Users')
// @UseGuards(PermissionsGuard)
export class UserController {
  constructor(private readonly usersService: UsersService) { }

  @Post('register-shop')
  async createSeller(@Req() req: Request, @Body() data: any) {
    const accessToken = req.cookies['accessToken'];
    const refreshToken = req.cookies['refreshToken'];
    if (!accessToken) {
      throw new UnauthorizedException('Authentication required');
    }

    // await this.usersService.refreshToken(refreshToken);
    return this.usersService.createOrUpdateSeller(data, accessToken, refreshToken);
  }

  @Post('refresh_token')
  async refreshToken(@Req() req: Request) {
    try {
      const refreshToken = req.cookies['refreshToken'];
      const result = await this.usersService.refreshToken(refreshToken);
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('register')
  async register(@Body() userDto: MinimalRegisterDto) {
    try {
      // Register the user in Keycloak and assign roles
      const result = await this.usersService.register(userDto);
      return {
        success: true,
        userId: result.userId, // Return user ID for reference
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }


  @Post('login')
  async login(
    @Body() loginDto: { username: string; password: string },
    @Res({ passthrough: true }) res: Response
  ) {
    try {
      const result = await this.usersService.loginAndExchange(
        loginDto.username,
        loginDto.password,
        []
      );

      console.log(result);

      // Assuming result contains your tokens and profile data
      // Set standardAccessToken as an HTTP‑only cookie
      res.cookie('accessToken', result.standardAccessToken, {
        httpOnly: true,
        secure: false, // must be true in production (HTTPS)
        sameSite: 'lax', // allow cross-site usage (including different ports)
        domain: EnvValue.domain, // explicitly set the domain (omit if you're using a subdomain)
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      res.cookie('rptToken', result.rptAccessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        domain: EnvValue.domain,
        maxAge: 60 * 60 * 1000,
      });

      res.cookie('refreshToken', result.refresh_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        domain: EnvValue.domain,
        maxAge: 24 * 60 * 60 * 1000,
      });


      // Return non-sensitive data (e.g., user profile) to the client
      return { message: 'Login successful', profile: result.profile };
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  @Get('callback')
  async handleCallback(@Query('code') code: string, @Query('session_state') sessionState: string, @Res() res) {
    // Exchange the authorization code for tokens
    const tokens = await this.usersService.exchangeCodeForTokens(code);

    // Extract user info from the token or make a userinfo request
    const userInfo = await this.usersService.getUserInfo(tokens.access_token);

    //TODO: Create a session for the user

    // Redirect to your frontend app with a session cookie or token
    return res.redirect(`http://${env.REDIRECT_GATEWAY}/home`);
  }

  //USE THIS TO GET THE PROFILE WITH JWT GUARD
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: Request) {
    // req.user contains the validated JWT payload
    return req.user;
  }

  //USE THIS TO GET THE PROFILE WITH ACCESS TOKEN
  @Get('my-profile')
  async getMyProfile(@Req() req: Request) {
    const accessToken = req.cookies['accessToken'];

    if (!accessToken) {
      throw new UnauthorizedException('Authentication required');
    }

    // Decode the JWT token to get email
    try {
      const tokenParts = accessToken.split('.');
      if (tokenParts.length !== 3) {
        throw new UnauthorizedException('Invalid token format');
      }

      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      const email = payload.email || payload.preferred_username;

      if (!email) {
        throw new UnauthorizedException('Email not found in token');
      }

      return this.usersService.fetchProfileByEmail(email);

    } catch (error) {
      throw new UnauthorizedException('Error decoding token');
    }
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    try {
      const refreshToken = req.cookies['refreshToken'];
      return await this.usersService.logout(refreshToken || '', res);
    } catch (error) {
      throw new HttpException('Failed to logout', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('login-admin')
  async adminLogin(
    @Body() loginDto: AdminLoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    try {
      if (!loginDto.username || !loginDto.password || !loginDto.otpCode) {
        throw new HttpException('Username, password and OTP code are required', HttpStatus.BAD_REQUEST);
      }

      const result = await this.usersService.authenticateAdmin(
        loginDto.username,
        loginDto.password,
        loginDto.otpCode
      );

      res.cookie('accessToken', result.standardAccessToken, {
        httpOnly: true,
        secure: false, // must be true in production (HTTPS)
        sameSite: 'lax', // allow cross-site usage (including different ports)
        domain: EnvValue.domain, // explicitly set the domain (omit if you're using a subdomain)
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      res.cookie('rptToken', result.rptAccessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        domain: EnvValue.domain,
        maxAge: 60 * 60 * 1000,
      });

      res.cookie('refreshToken', result.refresh_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        domain: EnvValue.domain,
        maxAge: 24 * 60 * 60 * 1000,
      });

      return {
        message: 'Admin login successful',
        profile: result.profile
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  @Get('verify-token')
  async verifyToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    try {
      const accessToken = req.cookies['accessToken'];

      // Check if token exists
      if (!accessToken) {
        return {
          isAuthenticated: false,
          message: 'No authentication token found'
        };
      }

      // Validate the token by decoding and checking expiration
      try {
        const tokenParts = accessToken.split('.');
        if (tokenParts.length !== 3) {
          return { isAuthenticated: false, message: 'Invalid token format' };
        }

        const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());

        // Check token expiration
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < currentTime) {
            return { isAuthenticated: false, message: 'Token expired' };
        }

        // Token exists and is valid
        return {
          isAuthenticated: true,
          message: 'Token is valid',
        };

      } catch (error) {
        return { isAuthenticated: false, message: 'Error validating token' };
      }
    } catch (error) {
      throw new HttpException('Token verification failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
