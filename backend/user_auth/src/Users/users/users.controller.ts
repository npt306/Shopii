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

  @Get('view-product')
  @Permissions('Product Management#view')
  viewProduct() {
    return { message: 'Viewing product data' };
  }

  @Get('delete_test')
  @Permissions('User Management#delete')
  testingstuff() {
    return { message: 'Deleting data' };
  }

  @Post('register-shop')
  async createOrUpdateSeller(@Body() sellerDto: any): Promise<any> {
    try {
      return await this.usersService.createOrUpdateSeller(sellerDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
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
}
