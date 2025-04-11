import { Module } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { VouchersController } from './vouchers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voucher } from './entities/voucher.entity';
import { VoucherHistory } from './entities/voucher-history.entity';
import { UserVoucher } from './entities/user-voucher.entity';
import { SellerVoucher } from './entities/seller-voucher.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Voucher, VoucherHistory, UserVoucher, SellerVoucher])],
  controllers: [VouchersController],
  providers: [VouchersService],
})
export class VouchersModule {}