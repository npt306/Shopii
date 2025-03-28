import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Patch,
  Body,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Controller('api/product')
export class ProductController {
  constructor(private readonly httpService: HttpService) {}

  @Get('/detail/:id')
  async getProductDetail(@Param('id') id: number) {
    try {
      const response = await this.httpService
        .get(`${process.env.PRODUCT_SERVICE_URL}/product/classifications/${id}`)
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
        .get(`${process.env.PRODUCT_SERVICE_URL}/product/`)
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

  // Admin routes
  @Get('admin/products')
  async getAdminProducts(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    try {
      let url = `${process.env.PRODUCT_SERVICE_URL}/product/admin/products?page=${page}&limit=${limit}`;
      if (status) {
        url += `&status=${status}`;
      }
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const { data } = await firstValueFrom(this.httpService.get(url));
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  @Get('admin/products/:id')
  async getAdminProduct(@Param('id', ParseIntPipe) id: number) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          `${process.env.PRODUCT_SERVICE_URL}/product/admin/products/${id}`,
        ),
      );
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  @Patch('admin/products/:id/approve')
  async approveProduct(@Param('id', ParseIntPipe) id: number) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.patch(
          `${process.env.PRODUCT_SERVICE_URL}/product/admin/products/${id}/approve`,
          {},
        ),
      );
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  @Patch('admin/products/:id/block')
  async blockProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { reason: string },
  ) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.patch(
          `${process.env.PRODUCT_SERVICE_URL}/product/admin/products/${id}/block`,
          body,
        ),
      );
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  @Delete('admin/products/:id')
  async deleteProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { reason: string },
  ) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.delete(
          `${process.env.PRODUCT_SERVICE_URL}/product/admin/products/${id}`,
          { data: body }, // Send reason in the request body for DELETE
        ),
      );
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error.response) {
      throw new HttpException(error.response.data, error.response.status);
    } else if (error.request) {
      throw new HttpException(
        'No response received from product service',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    } else {
      throw new HttpException(
        'Error setting up request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
