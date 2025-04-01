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

    return this.vouchersService.getAllVouchersPaginated(page, limit, search, status);
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
  getAllVouchers(@Param('userId', ParseIntPipe) userId: number) {
    return this.vouchersService.getActiveVouchers(userId);
  }

  @Get('/user-vouchers/:userId')
  getUserVouchers(@Param('userId', ParseIntPipe) userId: number) {
    return this.vouchersService.getUserVouchers(userId);
  }

  @Get('/history/:userId')
  getVoucherHistory(@Param('userId', ParseIntPipe) userId: number) {
    return this.vouchersService.getUserVoucherHistory(userId);
  }


  @Post('/claim')
  async addVoucherToUser(@Body() createUserVoucherDto: any): Promise<any> {
    return this.vouchersService.userClaimVoucher(createUserVoucherDto);
  }
}
