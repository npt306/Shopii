import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProductController } from './product.controller';

@Module({
  imports: [
    HttpModule.register({
      baseURL: process.env.PRODUCT_SERVICE_URL,
    }),
  ],
  controllers: [ProductController],
})
export class ProductModule { }
