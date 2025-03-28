import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountManagementController } from './accounts-management.controller';
import { AccountManagementService } from './accounts-management.service';
import { Account } from 'src/entity/Account.entity';
import { Seller } from 'src/entity/seller.entity';
import { Address } from 'src/entity/address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Seller, Address])],
  controllers: [AccountManagementController],
  providers: [AccountManagementService],
})
export class UserManagementModule {}
