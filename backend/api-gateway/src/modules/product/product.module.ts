import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProductController } from './product.controller';

@Module({
  imports: [HttpModule],
  controllers: [ProductController],
  providers: [],
})
export class ProductModule {}
