import { Controller, Get, Param } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Controller('product')
export class ProductController {
  constructor(private readonly httpService: HttpService) {}

  @Get('/detail/:id')
  async getProductDetail(@Param('id') id: number) {
    try {
      const response = await this.httpService
        .get(`http://localhost:3001/product/classifications/${id}`)
        .toPromise();
      if (response && response.data) {
        return response.data;
      } else {
        throw new Error('No response from the server');
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @Get('list/')
  async getProductList() {
    try {
      const response = await this.httpService
        .get(`http://localhost:3001/product/`)
        .toPromise();
      if (response && response.data) {
        return response.data;
      } else {
        throw new Error('No response from the server');
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
