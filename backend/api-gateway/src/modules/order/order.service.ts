import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrderService {
  constructor(private readonly httpService: HttpService) {}

  async addToCart(addToCartDto: any): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post('/carts/add-to-cart', addToCartDto),
    );
    return response.data;
  }

  async deleteFromCart(deleteFromCartDto: any): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post('/carts/delete-from-cart', deleteFromCartDto),
    );
    return response.data;
  }

  async updateCart(updateCartDto: any): Promise<any> {
    const response = await firstValueFrom(
      this.httpService.post('/carts/update-cart', updateCartDto),
    );
    return response.data;
  }
}
