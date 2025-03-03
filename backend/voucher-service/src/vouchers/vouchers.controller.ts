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
    Delete
  } from '@nestjs/common';
  import { VouchersService } from './vouchers.service';
  import { CreateVoucherDto } from './dto/create-voucher.dto';
  import { UpdateVoucherDto } from './dto/update-voucher.dto';
  
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
    update(@Param('id', ParseIntPipe) id: number, @Body() updateVoucherDto: UpdateVoucherDto) {
      return this.vouchersService.update(id, updateVoucherDto);
    }
  
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
      return this.vouchersService.remove(id);
    }
  }