import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

interface CreateOrderPayload {
  customerId: number;
  shippingAddress: string;
  paymentMethod: string;
  items: any[];
  totalAmount: number;
  shippingFee?: number;
  discountAmount?: number;
  voucherCode?: string;
  notes?: string;
}

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);
  constructor(private readonly httpService: HttpService) {}

  private handleHttpError(error: AxiosError, context: string): never {
    this.logger.error(`Error in ${context}: ${error.message}`, error.stack);
    if (error.response) {
      throw new HttpException(
        error.response.data || 'Downstream service error',
        error.response.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } else if (error.request) {
      throw new HttpException(
        'No response received from order service',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    } else {
      throw new HttpException(
        'Error setting up request to order service',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addToCart(addToCartDto: any): Promise<any> {
    try {
        const response = await firstValueFrom(
          this.httpService.post('/carts/add-to-cart', addToCartDto),
        );
        return response.data;
    } catch (error) {
        this.handleHttpError(error as AxiosError, 'addToCart');
    }
  }

  async deleteFromCart(deleteFromCartDto: any): Promise<any> {
     try {
        const response = await firstValueFrom(
          this.httpService.post('/carts/delete-from-cart', deleteFromCartDto),
        );
        return response.data;
    } catch (error) {
        this.handleHttpError(error as AxiosError, 'deleteFromCart');
    }
  }

  async updateCart(updateCartDto: any): Promise<any> {
     try {
        const response = await firstValueFrom(
          this.httpService.post('/carts/update-cart', updateCartDto),
        );
        return response.data;
    } catch (error) {
        this.handleHttpError(error as AxiosError, 'updateCart');
    }
  }

    async getCart(customerId: number): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`/carts/${customerId}`),
            );
            return response.data;
        } catch (error) {
            this.handleHttpError(error as AxiosError, `getCart for customer ${customerId}`);
        }
    }

    async getBasicCart(customerId: number): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`/carts/basic/${customerId}`),
            );
            return response.data;
        } catch (error) {
            this.handleHttpError(error as AxiosError, `getBasicCart for customer ${customerId}`);
        }
    }

    async deleteAllCart(customerId: number): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.get(`/carts/delete-all-cart/${customerId}`),
            );
            return response.data;
        } catch (error) {
            this.handleHttpError(error as AxiosError, `deleteAllCart for customer ${customerId}`);
        }
    }
}