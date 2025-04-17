import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'src/entity/Account.entity';
import { Seller } from 'src/entity/seller.entity';
import { SellerService } from './seller.service';
import { SellerController } from './seller.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Seller])],
  controllers: [SellerController],
  providers: [SellerService],
  exports: [SellerService],
}) 
export class SellerModule {}
