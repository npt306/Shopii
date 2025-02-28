import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findOne(id: number): Promise<Product | null> {
    return this.productRepository.findOneBy({ ProductID: id });
  }

  async getProductDetails(productId: number): Promise<Product> {
    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.classifications', 'classifications')
      .leftJoinAndSelect('product.details', 'details')
      .where('product.ProductID = :productId', { productId })
      .getOne();

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }
}
