import { Controller, Post, Get, Param } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Controller('order')
export class OrderController {
  constructor(private readonly httpService: HttpService) {}

  @Post('/carts/add-to-cart')
  async addToCart() {
    try {
      const response = await this.httpService.post(
        `${process.env.ORDER_SERVICE_URL}/carts/add-to-cart`,
      );
      if (response) {
        return response;
      } else {
        throw new Error('No response from the server');
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @Post('/carts/delete-from-cart')
  async deleteFromCart() {
    try {
      const response = await this.httpService.post(
        `${process.env.ORDER_SERVICE_URL}/carts/delete-from-cart`,
      );
      if (response) {
        return response;
      } else {
        throw new Error('No response from the server');
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @Post('/carts/update-cart')
  async updateCart() {
    try {
      const response = await this.httpService.post(
        `${process.env.ORDER_SERVICE_URL}/carts/update-cart`,
      );
      if (response) {
        return response;
      } else {
        throw new Error('No response from the server');
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @Get('/carts/delete-all-cart/:customerId')
  async deletedAllCart(@Param('customerId') id: number) {
    try {
      const response = await this.httpService
        .get(`${process.env.ORDER_SERVICE_URL}/carts/delete-all-cart/${id}`)
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

  @Get('/carts/:customerId')
  async getCart(@Param('customerId') id: number) {
    try {
      const response = await this.httpService
        .get(`${process.env.ORDER_SERVICE_URL}/carts/${id}`)
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

  @Get('/carts/basic/:customerId')
  async getBasicCart(@Param('customerId') id: number) {
    try {
      const response = await this.httpService
        .get(`${process.env.ORDER_SERVICE_URL}/carts/basic/${id}`)
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
