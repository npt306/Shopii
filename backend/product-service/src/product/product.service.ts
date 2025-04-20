import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, And, IsNull, Not } from 'typeorm';
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
import { AdminProductListDto } from './dto/admin-product-list.dto';
import { ProductStatus } from '../common/productStatus.enum';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { Logger } from '@nestjs/common';

interface CategoryWithChildren extends Categories {
  children?: CategoryWithChildren[];
}

interface ShopInfo {
  ShopName: string;
  Followers: number;
  total_products_same_seller: number;
}

@Injectable()
export class ProductService {
  storage: Storage;
  private bucket: Bucket;
  private readonly logger = new Logger(ProductService.name);

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
      throw new Error(
        'GCLOUD_PRIVATE_KEY or GCLOUD_CLIENT_EMAIL environment variable is not defined',
      );
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

  async getShopInfo(id: number): Promise<ShopInfo | null> {
    const shopInfo = await this.productRepository.query(
      `
        SELECT s."ShopName", s."Followers", COUNT(p2."ProductID") AS total_products
        FROM 
            public."Products" p1
        JOIN 
            public."Sellers" s ON p1."SellerID" = s.id
        JOIN 
            public."Products" p2 ON s.id = p2."SellerID"
        WHERE 
            p1."ProductID" = $1
        GROUP BY 
            s."ShopName", s."Followers";`,
      [id],
    );

    return shopInfo[0] ?? null;
  }
  
  async findOne(id: number): Promise<Product | null> {
    return this.productRepository.findOneBy({ ProductID: id });
  }

  async getProductDetails(productId: number): Promise<ProductDto> {
    console.log('Starting getProductsBySellerID');

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
      productID: product.ProductID,
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

  async getProductsBySellerID(sellerId: number): Promise<ProductDto[]> {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.classifications', 'classifications')
      .leftJoinAndSelect('product.details', 'details')
      .leftJoinAndSelect('details.Dimension', 'dimension') // Join the dimensions
      .where('product.SellerID = :sellerId', { sellerId })
      .getMany();

    if (!products.length) {
      throw new Error('No products found for this seller');
    }

    const productDtos: ProductDto[] = await Promise.all(
      products.map(async (product) => {
        const categoryIds = product.Categories;
        const categories = await this.categoriesRepository
          .createQueryBuilder('category')
          .where('category.CategoryID IN (:...categoryIds)', { categoryIds })
          .getMany();

        const classifications = await this.productClassificationTypeRepository
          .createQueryBuilder('classification')
          .where('classification.ProductID = :productId', {
            productId: product.ProductID,
          })
          .getMany();

        const productDto: ProductDto = {
          productID: product.ProductID,
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
            dimension: d.Dimension ? {
              weight: d.Dimension.Weight,
              length: d.Dimension.Length,
              width: d.Dimension.Width,
              height: d.Dimension.Height,
            } : null,
          })),
        };

        return productDto;
      }),
    );

    return productDtos;
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
    // Use fetch to call the external API
  try {


    const productWithId = { 
      ...createProductDto, 
      ProductID: savedProduct.ProductID 
    };
    //const baseUrl = this.configService.get<string>('SEARCH_SERVICE_BASE_URL');
    const response = await fetch(`${process.env.API_GATEWAY_URL}/api/search/index`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productWithId),
    });

    if (!response.ok) {
      throw new Error(`Failed to index product: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('Product indexed successfully:', responseData);
  } catch (error) {
    console.error('Error indexing product:', error.message);
  }

    return savedProduct;
  }

  async deleteProductDetail(productId: number, detailId: number): Promise<void> {
    const product = await this.productRepository.findOneBy({ ProductID: productId });
    if (!product) {
      throw new Error('Product not found');
    }

    const detailToDelete = await this.productDetailRepository.findOneBy({ ProductDetailTypeID: detailId, ProductID: productId });
    if (!detailToDelete) {
      throw new Error('Detail not found');
    }

    await this.productDetailRepository.delete({ ProductDetailTypeID: detailToDelete.ProductDetailTypeID });

    // Delete the associated dimension
    if (detailToDelete.Dimension) {
      await this.productDimensionsRepository.delete({ ProductDimensionsID: detailToDelete.Dimension.ProductDimensionsID });
    }

    // Check if this was the last detail for the product
    const remainingDetails = await this.productDetailRepository.find({ where: { ProductID: productId } });
    if (remainingDetails.length === 0) {
      // Delete classifications
      await this.productClassificationTypeRepository.delete({ ProductID: productId });

      // Delete the product
      await this.productRepository.delete({ ProductID: productId });
    }
  }

  async updateProductDetail(detailId: number, updateData: Partial<ProductDetailType>): Promise<ProductDetailType> {
    const detailToUpdate = await this.productDetailRepository.findOneBy({ ProductDetailTypeID: detailId });
    if (!detailToUpdate) {
      throw new Error('Detail not found');
    }

    if (updateData.Dimension) {
      if (!detailToUpdate.Dimension) {
        throw new Error('Dimension not found');
      }

      const dimensionToUpdate = await this.productDimensionsRepository.findOneBy({ ProductDimensionsID: detailToUpdate.Dimension.ProductDimensionsID });
      if (!dimensionToUpdate) {
        throw new Error('Dimension not found');
      }

      Object.assign(dimensionToUpdate, updateData.Dimension);
      await this.productDimensionsRepository.save(dimensionToUpdate);
    }

    Object.assign(detailToUpdate, updateData);
    return this.productDetailRepository.save(detailToUpdate);
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    const blob = this.bucket.file(`images/${uuidv4()}_${file.originalname}`);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    return new Promise((resolve, reject) => {
      blobStream
        .on('finish', () => {
          const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${blob.name}`;
          resolve(publicUrl);
        })
        .on('error', (err) => {
          reject(
            `Unable to upload image, something went wrong: ${err.message}`,
          );
        })
        .end(file.buffer);
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
      blobStream
        .on('finish', () => {
          const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${blob.name}`;
          resolve(publicUrl);
        })
        .on('error', (err) => {
          reject(
            `Unable to upload video, something went wrong: ${err.message}`,
          );
        })
        .end(file.buffer);
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

  // Admin methods
  async getAdminProducts(
    page: number,
    limit: number,
    status?: string,
    search?: string,
  ): Promise<AdminProductListDto> {
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (status) {
      queryBuilder.andWhere('product.Status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere('product.Name ILIKE :search', { search: `%${search}%` });
    }

    const [products, total] = await queryBuilder
      .leftJoinAndSelect('product.details', 'details')  // Include details for price
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('product.ProductID', 'DESC')
      .getManyAndCount();

    if (!products) {
      return {
        products: [],
        total: 0,
        page,
        limit
      }
    }

    const productList: any[] = products.map(product => {
      let minPrice = Infinity;
      let maxPrice = -Infinity;

      // Find min and max price among product details
      if (product.details && product.details.length > 0) {
        product.details.forEach(detail => {
          if (detail.Price < minPrice) {
            minPrice = detail.Price;
          }
          if (detail.Price > maxPrice) {
            maxPrice = detail.Price;
          }
        });
      }
      return {
        id: product.ProductID,
        name: product.Name,
        status: product.status,
        createdAt: product.CreatedAt,
        updatedAt: product.UpdatedAt,
        minPrice: minPrice === Infinity ? 0 : minPrice,  // Set to 0 if no details
        maxPrice: maxPrice === -Infinity ? 0 : maxPrice,  // Set to 0 if no details
      };
    });

    return {
      products: productList,
      total,
      page,
      limit,
    };
  }

  async getAdminProduct(id: number): Promise<ProductDto> {
    const product = await this.productRepository.findOne({
      where: { ProductID: id },
      relations: ['classifications', 'details', 'details.Dimension'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    const categoryIds = product.Categories;
    const categories = await this.categoriesRepository
      .createQueryBuilder('category')
      .where('category.CategoryID IN (:...categoryIds)', { categoryIds })
      .getMany();

    const classifications = await this.productClassificationTypeRepository
      .createQueryBuilder('classification')
      .where('classification.ProductID = :productId', {
        productId: product.ProductID,
      })
      .getMany();

    const productDto: ProductDto = {
      productID: product.ProductID,
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

  async approveProduct(id: number): Promise<Product> {
    const product = await this.productRepository.findOneBy({ ProductID: id });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    product.status = ProductStatus.APPROVED;

    const approvedProduct = await this.productRepository.save(product);

    // try {
    //   const productWithId = { 
    //     ...approvedProduct, 
    //     ProductID: approvedProduct.ProductID 
    //   };
    //   const response = await fetch(`${process.env.API_GATEWAY_URL}/api/search/index`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(productWithId),
    //   });
  
    //   if (!response.ok) {
    //     throw new Error(`Failed to index product: ${response.statusText}`);
    //   }
  
    //   const responseData = await response.json();
    //   console.log('Product indexed successfully:', responseData);
    // } catch (error) {
    //   console.error('Error indexing product:', error.message);
    // }

    return approvedProduct;


  }

  async blockProduct(id: number, reason: string): Promise<Product> {
    const product = await this.productRepository.findOneBy({ ProductID: id });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    product.status = ProductStatus.VIOLATED;
    console.log(`Product ${id} blocked. Reason: ${reason}`);
    return this.productRepository.save(product);
  }


  async deleteProduct(id: number, reason: string): Promise<void> {
    this.logger.log(`Attempting hard delete for Product ID: ${id}. Reason: ${reason}`);

    // Check if the product exists before attempting to delete
    const productExists = await this.productRepository.findOneBy({ ProductID: id });
    if (!productExists) {
      this.logger.warn(`Product with ID ${id} not found for deletion.`);
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Perform hard delete using the repository's delete method
    // The cascades defined in the entities will handle related records.
    const deleteResult = await this.productRepository.delete(id);

    if (deleteResult.affected === 0) {
        // This case might happen in a race condition or if the product was deleted between the check and the delete operation.
        this.logger.warn(`Hard delete affected 0 rows for Product ID: ${id}. It might have been deleted already.`);
        throw new NotFoundException(`Product with ID ${id} could not be deleted or was already deleted.`);
    }

    this.logger.log(`Product ID: ${id} hard deleted successfully. Reason: ${reason}`);

    try {
      const esResponse = await fetch(`${process.env.API_GATEWAY_URL}/api/search/${id}`, {
        method: 'DELETE',
      });

      if (!esResponse.ok) {
        throw new Error(`Elasticsearch deletion failed: ${esResponse.statusText}`);
      }

      const result = await esResponse.json();
      console.log(`Product ${id} deleted from Elasticsearch:`, result);
    } catch (err) {
      console.error(`Error deleting product from Elasticsearch: ${err.message}`);
    }
  }

}