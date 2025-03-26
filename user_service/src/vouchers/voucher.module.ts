import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voucher } from './entities/voucher.entity';
import { VoucherHistory } from './entities/voucher-history.entity';
import { UserVoucher } from './entities/user-voucher.entity';

import { VoucherService } from './voucher.service';
import { VoucherController } from './voucher.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Voucher, VoucherHistory, UserVoucher])],
  controllers: [VoucherController],
  providers: [VoucherService],
  exports: [VoucherService], // Export if needed in other modules
})
export class VoucherModule {}
