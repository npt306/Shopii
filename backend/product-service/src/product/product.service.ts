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
import { v4 as uuidv4 } from 'uuid';
import { Storage, Bucket } from '@google-cloud/storage';

interface CategoryWithChildren extends Categories {
  children?: CategoryWithChildren[];
}


@Injectable()
export class ProductService {
  storage: Storage;
  private bucket: Bucket;

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
  ) {
    const privateKey = process.env.GCLOUD_PRIVATE_KEY;
    const clientEmail = process.env.GCLOUD_CLIENT_EMAIL;

    if (!privateKey || !clientEmail) {
      throw new Error('GCLOUD_PRIVATE_KEY or GCLOUD_CLIENT_EMAIL environment variable is not defined');
    }

    this.storage = new Storage({
      projectId: process.env.GCLOUD_PROJECT_ID,
      credentials: {
        private_key: privateKey.replace(/\\n/g, '\n'),
        client_email: clientEmail,
      },
    });

    const bucketName: string | undefined = process.env.GCLOUD_BUCKET;
    if (!bucketName) {
      throw new Error('DB_GCLOUD_BUCKET environment variable is not defined');
    }
    this.bucket = this.storage.bucket(bucketName);
  }

  async findOne(id: number): Promise<Product | null> {
    return this.productRepository.findOneBy({ ProductID: id });
  }

  async getProductDetails(productId: number): Promise<ProductDto> {
    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.classifications', 'classifications')
      .leftJoinAndSelect('product.details', 'details')
      .where('product.ProductID = :productId', { productId })
      .getOne();

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
      const classificationEntities = classifications.map(classification => {
        return this.productClassificationTypeRepository.create({
          ...classification,
          ProductID: savedProduct.ProductID,
        });
      });
      await this.productClassificationTypeRepository.save(classificationEntities);
    }

    if (details) {
      const detailEntities = await Promise.all(details.map(async detail => {
        const { Dimension, ...detailData } = detail;

        const dimensionEntity = this.productDimensionsRepository.create(Dimension);
        const savedDimension = await this.productDimensionsRepository.save(dimensionEntity);

        return this.productDetailRepository.create({
          ...detailData,
          ProductID: savedProduct.ProductID,
          Dimension: savedDimension,
        });
      }));
      await this.productDetailRepository.save(detailEntities);
    }

    return savedProduct;
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const blob = this.bucket.file(`images/${uuidv4()}_${file.originalname}`);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    return new Promise((resolve, reject) => {
      blobStream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${blob.name}`;
        resolve(publicUrl);
      }).on('error', (err) => {
        reject(`Unable to upload image, something went wrong: ${err.message}`);
      }).end(file.buffer);
    });
  }

  async deleteImage(url: string): Promise<void> {
    // Tách tên tệp từ URL
    const fileName: string | undefined = url.split('/').pop();
    if (!fileName) {
      throw new Error('Invalid URL: Unable to extract file name');
    }
    // Xác định đường dẫn tệp trong bucket
    const filePath = `images/${fileName}`;
    // Xóa tệp từ bucket
    await this.bucket.file(filePath).delete();
  }

  async uploadVideo(file: Express.Multer.File): Promise<string> {
    const blob = this.bucket.file(`videos/${uuidv4()}_${file.originalname}`);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    return new Promise((resolve, reject) => {
      blobStream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${blob.name}`;
        resolve(publicUrl);
      }).on('error', (err) => {
        reject(`Unable to upload video, something went wrong: ${err.message}`);
      }).end(file.buffer);
    });
  }

  async deleteVideo(url: string): Promise<void> {
    // Tách tên tệp từ URL
    const fileName: string | undefined = url.split('/').pop();
    if (!fileName) {
      throw new Error('Invalid URL: Unable to extract file name');
    }
    // Xác định đường dẫn tệp trong bucket
    const filePath = `videos/${fileName}`;
    // Xóa tệp từ bucket
    await this.bucket.file(filePath).delete();
  }

  async testGetCategoriesRaw() {
    return this.categoriesRepository
      .createQueryBuilder('categories')
      .where('categories.id = :id', { id: 'categories' }) // 🚨 Lỗi: ID phải là số nguyên
      .getRawMany();
  }



}