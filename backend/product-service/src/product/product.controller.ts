import { Controller, Get, Param, Post, Body, Delete, UseInterceptors, UploadedFile, Put } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto'; // Import DTO
import { ProductDetailType } from './entities/product-detail-type.entity';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Product | null> {
    return this.productService.findOne(id);
  }

  @Get('/classifications/:id')
  async getProduct(@Param('id') id: string) {
    return this.productService.getProductDetails(+id);
  }

  @Get()
  async getProducts() {
    return this.productService.getProductList();
  }

  @Get('seller/:sellerId')
  async getProductsBySellerID(@Param('sellerId') sellerId: number) {
    return this.productService.getProductsBySellerID(sellerId);
  }

  @Post()
  async addProduct(
    @Body() createProductDto: CreateProductDto,
  ): Promise<Product> {
    return this.productService.addProduct(createProductDto);
  }

  @Delete(':productId/detail/:detailIndex')
  async deleteProductDetail(
    @Param('productId') productId: number,
    @Param('detailIndex') detailIndex: number,
  ): Promise<void> {
    await this.productService.deleteProductDetail(productId, detailIndex);
  }

  @Put('detail/:detailId')
  async updateProductDetail(
    @Param('detailId') detailId: number,
    @Body() updateData: Partial<ProductDetailType>,
  ): Promise<ProductDetailType> {
    return this.productService.updateProductDetail(detailId, updateData);
  }

  @Post('uploadIMG')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File): Promise<{ url: string }> {
    const url = await this.productService.uploadImage(file);
    return { url };
  }

  @Delete('deleteIMG')
  async deleteImage(@Body('url') url: string): Promise<void> {
    await this.productService.deleteImage(url);
  }

  @Post('uploadVideo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadVideo(@UploadedFile() file: Express.Multer.File): Promise<{ url: string }> {
    const url = await this.productService.uploadVideo(file);
    return { url };
  }

  @Delete('deleteVideo')
  async deleteVideo(@Body('url') url: string): Promise<void> {
    await this.productService.deleteVideo(url);
  }

}