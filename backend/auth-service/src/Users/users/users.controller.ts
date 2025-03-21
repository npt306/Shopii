import { Controller, Post, Body, Get, Delete, UseGuards, HttpException, HttpStatus, Req, UnauthorizedException, HttpCode, Query, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { Permissions } from 'src/guards/permission.decorator';
import { PermissionsGuard } from 'src/guards/permission.guard';
import { UserDto } from 'src/dto/user.dto';
import { UsersService } from './users.service';
import { env } from 'process';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { MinimalRegisterDto } from 'src/dto/register.dto';

@Controller('Users')
@UseGuards(PermissionsGuard)
export class UserController {
  constructor(private readonly usersService: UsersService) { }

  @Get('profile')
  @Permissions('Accounts#View')
  viewProfile() {
    return { message: 'Viewing limited profile data' };
  }

  @Get('view-product')
  @Permissions('Product#View')
  viewProduct() {
    return { message: 'Viewing product data' };
  }

  @Get('delete_test')
  @Permissions('Product#Delete')
  testingstuff() {
    return { message: 'Deleting data' };
  }

  @Get('add_product')
  @Permissions('Product#Add')
  testingproduct() {
    return { message: 'Deleting data' };
  }

  @Post('register-shop')
  async createSeller(@Req() req: Request, @Body() data: any) {
    const accessToken = req.cookies['accessToken'];
    const refreshToken = req.cookies['refreshToken'];
    if (!accessToken) {
      throw new UnauthorizedException('Authentication required');
    }
    
    return this.usersService.createOrUpdateSeller(data, accessToken, refreshToken);
  }

  @Post('refresh_token')
  async refreshToken(@Body() body: { refresh_token: string }) {
    try {
      const result = await this.usersService.refreshToken(body.refresh_token);
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
        domain: '34.58.241.34', // explicitly set the domain (omit if you're using a subdomain)
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      res.cookie('rptToken', result.rptAccessToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        domain: '34.58.241.34',
        maxAge: 60 * 60 * 1000,
      });

      res.cookie('refreshToken', result.refresh_token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        domain: '34.58.241.34',
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

  @Post('auth/exchange-token')
  async exchangeToken(@Body() tokenData: { code: string, sessionState: string }, @Res({ passthrough: true }) response: Response) {
    try {
      console.log("Starting token exchange process with code:", tokenData.code.substring(0, 8) + "...");

      // Step 1: Exchange code for tokens
      const tokens = await this.usersService.exchangeCodeForTokens(tokenData.code);

      // If we got here, we have valid tokens - now get user info
      console.log("Token exchange successful, fetching user info");
      const userInfo = await this.usersService.getUserInfo(tokens.access_token);

      // Create user session
      console.log("User info obtained, creating session for:", userInfo.email || userInfo.preferred_username);
      const session = await this.usersService.createUserSession(userInfo, tokens);

      // Set HTTP-only cookies for security
      response.cookie('refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Return user info and access token to frontend
      return {
        user: session,
        access_token: tokens.access_token,
      };
    } catch (error) {
      console.error('Token exchange error:', error);

      if (error.message?.includes('Code not valid') || error.message?.includes('expired')) {
        throw new HttpException('Authentication code expired or already used. Please try logging in again.', HttpStatus.BAD_REQUEST);
      }

      throw new HttpException(error.message || 'Authentication failed', HttpStatus.UNAUTHORIZED);
    }
  }

  @Post('send-verification-email')
  async sendVerificationEmail(@Body() body: { email: string }) {
    try {
      const result = await this.usersService.sendEmailVerification(body.email);
      return {
        success: true,
        message: 'Verification email sent successfully',
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('check-email-verification')
  async checkEmailVerification(@Query('email') email: string) {
    try {
      const isVerified = await this.usersService.checkEmailVerification(email);
      return {
        success: true,
        isVerified,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: Request) {
    // req.user contains the validated JWT payload
    return req.user;
  }
}
