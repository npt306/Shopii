import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  ParseIntPipe,
  Query,
  Put,
} from '@nestjs/common';
import { VouchersService } from './vouchers.service';

@Controller('api/vouchers')
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @Post()
  async createVoucher(@Body() createVoucherDto: any): Promise<any> {
    return this.vouchersService.createVoucher(createVoucherDto);
  }

  @Get()
  async getAllVouchersPaginated(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ): Promise<any> {
    return this.vouchersService.getAllVouchersPaginated(
      page,
      limit,
      search,
      status,
    );
  }

  @Get(':id')
  async getVoucherById(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.vouchersService.getVoucherById(id);
  }

  @Patch(':id')
  async updateVoucher(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVoucherDto: any,
  ): Promise<any> {
    return this.vouchersService.updateVoucher(id, updateVoucherDto);
  }

  @Delete(':id')
  async deleteVoucher(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.vouchersService.deleteVoucher(id);
  }

  @Get('/all/:userId')
  async getAllVouchers(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<any> {
    return this.vouchersService.getActiveVouchers(userId);
  }

  @Get('/user-vouchers/:userId')
  async getUserVouchers(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<any> {
    return this.vouchersService.getUserVouchers(userId);
  }
  @Get('/user-sellervouchers/:userId')
  async getUserSellerVouchers(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<any> {
    return this.vouchersService.getUserSellerVouchers(userId);
  }
  @Get('/history/:userId')
  async getVoucherHistory(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<any> {
    return this.vouchersService.getUserVoucherHistory(userId);
  }

  @Post('/use')
  async useVoucher(@Body() createVoucherHistoryDto: any): Promise<any> {
    return this.vouchersService.userUseVoucher(createVoucherHistoryDto);
  }

  @Post('/claim')
  async addVoucherToUser(@Body() createUserVoucherDto: any): Promise<any> {
    return this.vouchersService.userClaimVoucher(createUserVoucherDto);
  }

  @Get('/seller-vouchers/all/:shopId')
  async findAllSellerVoucher(
    @Param('shopId', ParseIntPipe) shopId: number,
  ): Promise<any> {
    console.log('shopId', shopId);
    // return true;
    return this.vouchersService.findAllSellerVouchers(shopId);
  }
  @Get('/seller-vouchers/active/:shopId')
  async findActiveSellerVoucher(@Param('id') id: number): Promise<any> {
    return this.vouchersService.findActiveSellerVoucher(id);
  }
  @Get('/seller-vouchers/:id')
  async findOneSellerVoucher(@Param('id') id: number): Promise<any> {
    return this.vouchersService.findOneSellerVoucher(id);
  }

  @Post('/seller-vouchers')
  async createSellerVoucher(@Body() voucherDto: any): Promise<any> {
    console.log('voucherDto', voucherDto);
    // return true;
    return this.vouchersService.createSellerVoucher(voucherDto);
  }

  @Put('/seller-vouchers/:id')
  async updateSellerVoucher(
    @Param('id') id: number,
    @Body() voucherDto: any,
  ): Promise<any> {
    console.log('voucherDto', voucherDto);
    console.log('id', id);
    // return true;
    return this.vouchersService.updateSellerVoucher(id, voucherDto);
  }

  // Delete a seller voucher by ID
  @Delete('/seller-vouchers/:id')
  async removeSellerVoucher(@Param('id') id: number): Promise<any> {
    return this.vouchersService.deleteSellerVoucher(id);
  }
}
