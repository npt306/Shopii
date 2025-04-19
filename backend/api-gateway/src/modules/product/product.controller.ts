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
  Post,
  Put,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { FastifyRequest } from 'fastify';
import * as FormData from 'form-data';
import * as concat from 'concat-stream';

@Controller('api/product')
export class ProductController {
  constructor(private readonly httpService: HttpService) { }

  @Get('/shop-info/:productId')
  async getShopInfo(@Param('productId') id: number) {
    try {
      const response = await this.httpService
        .get(`${process.env.PRODUCT_SERVICE_URL}/product/shop-info/${id}`)
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
  
  // Existing endpoints
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

  // Admin routes - Existing
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

  // Get product by ID
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          `${process.env.PRODUCT_SERVICE_URL}/product/${id}`,
        ),
      );
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get products by seller ID
  @Get('seller/:sellerId')
  async getProductsBySellerID(@Param('sellerId', ParseIntPipe) sellerId: number) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.get(
          `${process.env.PRODUCT_SERVICE_URL}/product/seller/${sellerId}`,
        ),
      );
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Add new product
  @Post()
  async addProduct(@Body() createProductDto: any) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(
          `${process.env.PRODUCT_SERVICE_URL}/product`,
          createProductDto,
        ),
      );
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Delete product detail
  @Delete(':productId/detail/:detailIndex')
  async deleteProductDetail(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('detailIndex', ParseIntPipe) detailIndex: number,
  ) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.delete(
          `${process.env.PRODUCT_SERVICE_URL}/product/${productId}/detail/${detailIndex}`,
        ),
      );
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Update product detail
  @Put('detail/:detailId')
  async updateProductDetail(
    @Param('detailId', ParseIntPipe) detailId: number,
    @Body() updateData: any,
  ) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.put(
          `${process.env.PRODUCT_SERVICE_URL}/product/detail/${detailId}`,
          updateData,
        ),
      );
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Upload image
  @Post('uploadIMG')
  async uploadImage(@Req() req: FastifyRequest) {
    try {
      // Make sure we're properly getting the multipart data
      const data = await req.file();

      if (!data) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }

      console.log('Received file data:', data); // Debug the data structure

      // Create a buffer from the file stream
      const buffer = await data.toBuffer(); // This is a simpler way to get the buffer with Fastify

      // Create FormData object
      const formData = new FormData();
      formData.append('file', buffer, {
        filename: data.filename,
        contentType: data.mimetype || 'application/octet-stream',
      });

      // Send to product service
      const response = await firstValueFrom(
        this.httpService.post(
          `${process.env.PRODUCT_SERVICE_URL}/product/uploadIMG`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
          },
        ),
      );
      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      if (error.response) {
        console.error('Error response details:', error.response.data);
      }
      throw new HttpException(
        'Error uploading file to product service',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Delete image
  @Delete('deleteIMG')
  async deleteImage(@Body('url') url: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.delete(
          `${process.env.PRODUCT_SERVICE_URL}/product/deleteIMG`,
          { data: { url } },
        ),
      );
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Upload video
  @Post('uploadVideo')
  async uploadVideo(@Req() req: FastifyRequest) {
    try {
      // Make sure we're properly getting the multipart data
      const data = await req.file();

      if (!data) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }

      console.log('Received file data:', data); // Debug the data structure

      // Create a buffer from the file stream
      const buffer = await data.toBuffer(); // This is a simpler way to get the buffer with Fastify

      // Create FormData object
      const formData = new FormData();
      formData.append('file', buffer, {
        filename: data.filename,
        contentType: data.mimetype || 'application/octet-stream',
      });

      // Send to product service
      const response = await firstValueFrom(
        this.httpService.post(
          `${process.env.PRODUCT_SERVICE_URL}/product/uploadVideo`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
          },
        ),
      );
      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      if (error.response) {
        console.error('Error response details:', error.response.data);
      }
      throw new HttpException(
        'Error uploading file to product service',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Delete video
  @Delete('deleteVideo')
  async deleteVideo(@Body('url') url: string) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.delete(
          `${process.env.PRODUCT_SERVICE_URL}/product/deleteVideo`,
          { data: { url } },
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