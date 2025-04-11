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
  Put,
} from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { CreateUserVoucherDto } from './dto/user-voucher.dto';
import { QueryVoucherDto } from './dto/query-voucher.dto';
import { SellerVoucherDto } from './dto/seller-voucher.dto';
import { CreateVoucherHistoryDto } from './dto/voucher-history.dto';
@Controller('vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  create(@Body() createVoucherDto: CreateVoucherDto) {
    return this.vouchersService.create(createVoucherDto);
  }

  @Get()
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
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

  // USER VOUCHERS
  @Get('/all/:userId')
  async getAllVouchers(@Param('userId', ParseIntPipe) userId: number) {
    console.log('[GET] /all/:userId ->', userId);
    return this.vouchersService.getActiveVouchers(userId);
  }

  @Get('/user-vouchers/:userId')
  async getUserVouchers(@Param('userId', ParseIntPipe) userId: number) {
    console.log('[GET] /user-vouchers/:userId ->', userId);
    return this.vouchersService.getUserVouchers(userId);
  }

  @Get('/user-sellervouchers/:userId')
  async getUserSellerVouchers(@Param('userId', ParseIntPipe) userId: number) {
    console.log('[GET] /user-sellervouchers/:userId ->', userId);
    return this.vouchersService.getUserSellerVouchers(userId);
  }

  @Get('/history/:userId')
  async getVoucherHistory(@Param('userId', ParseIntPipe) userId: number) {
    console.log('[GET] /history/:userId ->', userId);
    return this.vouchersService.getUserVoucherHistory(userId);
  }

  @Post('/use')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async useVoucher(@Body() createVoucherHistoryDto: CreateVoucherHistoryDto) {
    console.log('[POST] /use ->', createVoucherHistoryDto);
    return this.vouchersService.userUseVoucher(createVoucherHistoryDto);
  }

  @Post('/claim')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async addVoucherToUser(@Body() createUserVoucherDto: CreateUserVoucherDto) {
    console.log('[POST] /claim ->', createUserVoucherDto);
    return this.vouchersService.userClaimVoucher(createUserVoucherDto);
  }

  // SELLER VOUCHERS
  @Get('/seller-vouchers/all/:shopId')
  async findAllSellerVoucher(@Param('shopId') id: number): Promise<any[]> {
    console.log('[GET] /seller-vouchers/all/:shopId ->', id);
    return this.vouchersService.findAllSellerVoucher(id);
  }

  @Get('/seller-vouchers/active/:shopId')
  async findActiveSellerVoucher(@Param('shopId') id: number): Promise<any[]> {
    console.log('[GET] /seller-vouchers/active/:shopId ->', id);
    return this.vouchersService.findAllActiveSellerVoucher(id);
  }

  @Get('/seller-vouchers/:id')
  async findOneSellerVoucher(@Param('id') id: number): Promise<any> {
    console.log('[GET] /seller-vouchers/:id ->', id);
    return this.vouchersService.findOneSellerVoucher(id);
  }

  @Post('/seller-vouchers/')
  async createSellerVoucher(
    @Body() voucherDto: SellerVoucherDto,
  ): Promise<any> {
    console.log('[POST] /seller-vouchers ->', voucherDto);
    return this.vouchersService.createSellerVoucher(voucherDto);
  }

  @Put('/seller-vouchers/:id')
  async updateSellerVoucher(
    @Param('id') id: number,
    @Body() voucherDto: SellerVoucherDto,
  ): Promise<any> {
    console.log('[PUT] /seller-vouchers/:id ->', { id, voucherDto });
    return this.vouchersService.updateSellerVoucher(id, voucherDto);
  }

  @Delete('/seller-vouchers/:id')
  async removeSellerVoucher(@Param('id') id: number): Promise<void> {
    console.log('[DELETE] /seller-vouchers/:id ->', id);
    return this.vouchersService.removeSellerVoucher(id);
  }
}
