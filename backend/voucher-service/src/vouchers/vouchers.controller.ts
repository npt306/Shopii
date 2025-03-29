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
import { QueryVoucherDto } from './dto/query-voucher.dto'; 

@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Post()

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  create(@Body() createVoucherDto: CreateVoucherDto) {
    return this.vouchersService.create(createVoucherDto);
  }

  @Get()

  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
  findAll(@Query() queryDto: QueryVoucherDto) { 
    return this.vouchersService.findAll(queryDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.vouchersService.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
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
  getAllVouchers(@Query('userId', ParseIntPipe) userId: number) {

    return this.vouchersService.getActiveVouchers(userId);
  }

  @Get('/user-vouchers')
  getUserVouchers(@Query('userId', ParseIntPipe) userId: number) {
    return this.vouchersService.getUserVouchers(userId);
  }

  @Get('/history')
  getVoucherHistory(@Query('userId', ParseIntPipe) userId: number) {
    return this.vouchersService.getUserVoucherHistory(userId);
  }

  @Post('/claim')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  addVoucherToUser(@Body() createUserVoucherDto: CreateUserVoucherDto) {
    return this.vouchersService.userClaimVoucher(createUserVoucherDto);
  }
}