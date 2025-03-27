import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { CreateUserVoucherDto } from './dto/user-voucher.dto';

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Post()
  create(@Body() createVoucherDto: CreateVoucherDto) {
    return this.vouchersService.create(createVoucherDto);
  }

  @Get()
  findAll() {
    return this.vouchersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vouchersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVoucherDto: UpdateVoucherDto,
  ) {
    return this.vouchersService.update(id, updateVoucherDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.vouchersService.remove(id);
  }

  @Get('/all')
  getAllVouchers(@Query('userId') userId: number) {
    return this.vouchersService.getActiveVouchers(userId);
  }

  @Get('/user-vouchers')
  getUserVouchers(@Query('userId') userId: number) {
    return this.vouchersService.getUserVouchers(userId);
  }

  @Get('/history')
  getVoucherHistory(@Query('userId') userId: number) {
    return this.vouchersService.getUserVoucherHistory(userId);
  }

  @Post('/claim')
  addVoucherToUser(@Body() createUserVoucherDto: CreateUserVoucherDto) {
    return this.vouchersService.userClaimVoucher(createUserVoucherDto);
  }
}
