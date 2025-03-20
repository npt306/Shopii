import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto'; // Import DTO

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

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

  @Post()
  async addProduct(
    @Body() createProductDto: CreateProductDto,
  ): Promise<Product> {
    return this.productService.addProduct(createProductDto);
  }
}
