import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto'; // Import DTO
import { ProductClassificationType } from './entities/product-classification-type.entity';
import { ProductDetailType } from './entities/product-detail-type.entity';
import { ProductDimensions } from './entities/product-dimensions.entity';
import { Categories } from './entities/category.entity';
import { ProductDto } from './dto/product.dto';
import { ProductListDto } from './dto/product-list.dto';
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductDetailType)
    private readonly productDetailRepository: Repository<ProductDetailType>,
    @InjectRepository(ProductDimensions)
    private readonly productDimensionsRepository: Repository<ProductDimensions>,
    @InjectRepository(Categories)
    private readonly categoriesRepository: Repository<Categories>,
    @InjectRepository(ProductClassificationType)
    private readonly productClassificationTypeRepository: Repository<ProductClassificationType>,
  ) {}

  async findOne(id: number): Promise<Product | null> {
    return this.productRepository.findOneBy({ ProductID: id });
  }

  async getProductDetails(productId: number) {
    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.classifications', 'classifications')
      .leftJoinAndSelect('product.details', 'details')
      .where('product.ProductID = :productId', { productId })
      .getOne();

    console.log(product);

    if (!product) {
      throw new Error('Product not found');
    }

    const categoryIds = product.Categories;
    const categories = await this.categoriesRepository
      .createQueryBuilder('category')
      .where('category.CategoryID IN (:...categoryIds)', { categoryIds })
      .getMany();

    const classifications = await this.productClassificationTypeRepository
      .createQueryBuilder('classification')
      .where('classification.ProductID = :productId', { productId })
      .getMany();

    const productDto: ProductDto = {
      name: product.Name,
      description: product.Description,
      categories: categories.map((c) => c.CategoryName),
      images: product.Images,
      soldQuantity: product.SoldQuantity,
      rating: product.Rating,
      coverImage: product.CoverImage,
      video: product.Video,
      quantity: product.Quantity,
      reviews: product.Reviews,
      classifications: classifications.map((c) => ({
        classTypeName: c.ClassTypeName,
        level: c.Level,
      })),
      details: product.details.map((d) => ({
        type_id: d.ProductDetailTypeID,
        type_1: d.Type_1,
        type_2: d.Type_2,
        image: d.Image,
        price: d.Price,
        quantity: d.Quantity,
      })),
    };

    return productDto;
  }

  async getProductList(): Promise<ProductListDto> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .orderBy('RANDOM()')
      .limit(20)
      .getMany();

    const productIds = products.map((p) => p.ProductID);

    // Truy vấn lấy giá thấp nhất của từng ProductID
    const minPrices = await this.productDetailRepository
      .createQueryBuilder('detail')
      .select('detail.ProductID', 'ProductID')
      .addSelect('MIN(detail.Price)', 'minPrice')
      .where('detail.ProductID IN (:...productIds)', { productIds })
      .groupBy('detail.ProductID')
      .getRawMany();

    const priceMap = new Map<number, number>(
      minPrices.map((p) => [p.ProductID, Number(p.minPrice)]),
    );

    const productListDto: ProductListDto = {
      products: products.map((product) => ({
        id: product.ProductID,
        name: product.Name,
        price: priceMap.get(product.ProductID) || 0,
        images: product.CoverImage || '',
        soldQuantity: product.SoldQuantity || 0,
      })),
    };

    return productListDto;
  }

  async addProduct(createProductDto: CreateProductDto): Promise<Product> {
    const { classifications, details, ...productData } = createProductDto;

    const product = this.productRepository.create(productData);
    const savedProduct = await this.productRepository.save(product);

    if (classifications) {
      const classificationEntities = classifications.map((classification) => {
        return this.productClassificationTypeRepository.create({
          ...classification,
          ProductID: savedProduct.ProductID,
        });
      });
      await this.productClassificationTypeRepository.save(
        classificationEntities,
      );
    }

    if (details) {
      const detailEntities = await Promise.all(
        details.map(async (detail) => {
          const { Dimension, ...detailData } = detail;

          const dimensionEntity =
            this.productDimensionsRepository.create(Dimension);
          const savedDimension =
            await this.productDimensionsRepository.save(dimensionEntity);

          return this.productDetailRepository.create({
            ...detailData,
            ProductID: savedProduct.ProductID,
            Dimension: savedDimension,
          });
        }),
      );
      await this.productDetailRepository.save(detailEntities);
    }

    return savedProduct;
  }
}
