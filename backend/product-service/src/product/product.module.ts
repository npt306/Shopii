import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductClassificationType } from './entities/product-classification-type.entity';
import { ProductDetailType } from './entities/product-detail-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductClassificationType,
      ProductDetailType,
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
