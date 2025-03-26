import { Controller, Post, Get, Param, Body, ParseIntPipe, Query } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { CreateUserVoucherDto } from './dto/user-voucher.dto';
@Controller('vouchers')
export class VoucherController {
  constructor(private readonly vouchersService: VoucherService) {}

  @Get('/all')
  getAllVouchers(@Query('userId') userId: number) {
    return this.vouchersService.getActiveVouchers(userId);
  }

  @Get('/user-vouchers')
  getUserVouchers(@Query('userId') userId: number) {
    return this.vouchersService.getUserVouchers(userId);
  }  

  @Get('/history/')
  getVoucherHistory(@Query('userId') userId: number) {
    return this.vouchersService.getUserVoucherHistory(userId);
  }

  @Post('/claim')
  addVoucherToUser(@Body() createUserVoucherDto: CreateUserVoucherDto){
    return this.vouchersService.userClaimVoucher(createUserVoucherDto);
  }

}
// export const VoucherController;