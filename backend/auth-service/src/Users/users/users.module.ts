import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity/User.entity';
import { HttpModule } from '@nestjs/axios';
import { Account } from 'src/entity/Account.entity';
import { Seller } from 'src/entity/seller.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, HttpModule, TypeOrmModule.forFeature([Account, Seller, User])],
  controllers: [UserController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}