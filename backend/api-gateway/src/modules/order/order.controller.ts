import { Controller, Post } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

@Controller('order')
export class OrderController {
  constructor(private readonly httpService: HttpService) {}

  @Post('/add-to-cart')
  async addProductToCart() {
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
}
