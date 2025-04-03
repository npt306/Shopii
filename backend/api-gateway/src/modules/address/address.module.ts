import { Module } from '@nestjs/common';
import { AddressController } from './address.controller';
import { AddressService } from './address.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
@Module({
  imports: [
    HttpModule.register({
      //baseURL: process.env.USERS_SERVICE_URL, 
      baseURL: 'http://localhost:3005', // Default value, can be overridden by ConfigService
    }),
  ],
  controllers: [AddressController],
  providers: [AddressService],
  exports: [AddressService],
})
export class AddressModule {}
