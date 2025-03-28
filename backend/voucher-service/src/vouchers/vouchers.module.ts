import { Module } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { VouchersController } from './vouchers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voucher } from './entities/voucher.entity';
import { VoucherHistory } from './entities/voucher-history.entity';
import { UserVoucher } from './entities/user-voucher.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Voucher, VoucherHistory, UserVoucher])],
  controllers: [VouchersController],
  providers: [VouchersService],
})
export class VouchersModule {}