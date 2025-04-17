import {
  Controller,
  Post,
  Param,
  Body,
  ParseIntPipe,
  Get,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SellerService } from './seller.service';

@Controller('api/seller')
export class SellerController {
  constructor(private readonly sellerService: SellerService) {}

  @Get(':id')
  async getSellerById(@Param('id', ParseIntPipe) id: number) {
    return this.sellerService.getSellerById(id);
  }
}
