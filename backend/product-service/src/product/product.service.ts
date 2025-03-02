import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto'; // Import DTO
import { ProductClassificationType } from './entities/product-classification-type.entity';
import { ProductDetailType } from './entities/product-detail-type.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductClassificationType)
    private readonly productClassificationRepository: Repository<ProductClassificationType>,
    @InjectRepository(ProductDetailType)
    private readonly productDetailRepository: Repository<ProductDetailType>,
  ) { }

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

  async addProduct(createProductDto: CreateProductDto): Promise<Product> {
    const { classifications, details, ...productData } = createProductDto;

    const product = this.productRepository.create(productData);
    const savedProduct = await this.productRepository.save(product);

    if (classifications) {
      const classificationEntities = classifications.map(classification => {
        return this.productClassificationRepository.create({
          ...classification,
          ProductID: savedProduct.ProductID,
        });
      });
      await this.productClassificationRepository.save(classificationEntities);
    }

    if (details) {
      const detailEntities = details.map(detail => {
        return this.productDetailRepository.create({
          ...detail,
          ProductID: savedProduct.ProductID,
        });
      });
      await this.productDetailRepository.save(detailEntities);
    }

    return savedProduct;
  }
}