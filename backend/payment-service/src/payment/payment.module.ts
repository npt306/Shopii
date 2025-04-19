import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { SellerBankAccount } from './entities/seller-bank-account.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([SellerBankAccount]),
    HttpModule, // For payout API calls
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}