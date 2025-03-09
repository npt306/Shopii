import { Controller, Post, Body, Get, Delete, UseGuards, HttpException, HttpStatus, Req, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { Permissions } from 'src/GUARDS/permission.decorator';
import { PermissionsGuard } from 'src/GUARDS/permission.guard';
import { UserDto } from 'src/DTO/user.dto';
import { UsersService } from './users.service';

@Controller('Users')
@UseGuards(PermissionsGuard)
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @Permissions('User Management#view')
  viewProfile() {
    return { message: 'Viewing limited profile data' };
  }

  @Get('delete-product')
  @Permissions('Product Management#delete')
  deleteProduct() {
    return { message: 'deleting product data' };
  }

  @Get('view-product')
  @Permissions('Product Management#view')
  viewProduct() {
    return { message: 'Viewing product data' };
  }

  @Get('delete_test')
  @Permissions('delete')
  testingstuff() {
    return { message: 'Viewing limited profile data' };
  }

  @Post('add-seller-role')
  async addSellerRole(@Body('userId') userId: string): Promise<any> {
    if (!userId) {
      throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
    }
    return this.usersService.addSellerRole(userId);
  }

  @Delete(':id')
  @Permissions('delete')
  deleteUser() {
    return { message: 'User deleted' };
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
  async register(@Body() userDto: UserDto) {
    try {
      // Register the user and trigger email verification
      const result = await this.usersService.register(userDto);
      
      return {
        success: true,
        userId: result.userId // Return user ID for reference
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
  

  @Post('login')
  async login(@Body() loginDto: { username: string; password: string }) {
    try {
      const result = await this.usersService.loginAndExchange(loginDto.username, loginDto.password, []);
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
    }
  }

  // Add a resend verification endpoint
  // @Post('resend-verification')
  // async resendVerification(@Body() { email }: { email: string }) {
  //   try {
  //     const exists = await this.usersService.userExists(email);
  //     if (!exists) {
  //       throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  //     }
      
  //     await this.usersService.sendVerificationEmail(email);
  //     return { 
  //       success: true, 
  //       message: 'Verification email sent. Please check your inbox.' 
  //     };
  //   } catch (error) {
  //     throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  //   }
  // }

  // // Add a verification endpoint to handle the verification link
  // @Get('verify')
  // async verifyEmail(@Query('token') token: string) {
  //   try {
  //     const result = await this.usersService.verifyEmail(token);
  //     return { 
  //       success: true, 
  //       message: 'Email successfully verified. You can now log in.' 
  //     };
  //   } catch (error) {
  //     throw new HttpException('Invalid or expired verification token', HttpStatus.BAD_REQUEST);
  //   }
  // }
}
