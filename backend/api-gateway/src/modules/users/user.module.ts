import { Module } from '@nestjs/common';
import { UsersController } from './user.controller';
import { UsersService } from './user.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
@Module({
  imports: [
    HttpModule.register({
      baseURL: process.env.USERS_SERVICE_URL, 
      //baseURL: 'http://localhost:3005', // Default value, can be overridden by ConfigService
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
