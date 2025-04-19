import { Injectable, Logger, HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';

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
  private readonly orderServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    const urlFromEnv = this.configService.get<string>('ORDER_SERVICE_URL');
    if (!urlFromEnv) {
      this.logger.error('ORDER_SERVICE_URL is not defined in environment variables!');
      throw new InternalServerErrorException('Configuration Error: ORDER_SERVICE_URL is missing.');
    }
    this.orderServiceUrl = urlFromEnv;
    this.logger.log(`Order Service URL configured: ${this.orderServiceUrl}`);
  }

  private handleHttpError(error: AxiosError, context: string): never {
    this.logger.error(`Error in ${context}: ${error.message}`, error.stack);
    if (error.response) {
      this.logger.error(`Downstream error details: Status ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`);
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
      this.handleHttpError(
        error as AxiosError,
        `getCart for customer ${customerId}`,
      );
    }
  }

  async getBasicCart(customerId: number): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/carts/basic/${customerId}`),
      );
      return response.data;
    } catch (error) {
      this.handleHttpError(
        error as AxiosError,
        `getBasicCart for customer ${customerId}`,
      );
    }
  }

  async deleteAllCart(customerId: number): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`/carts/delete-all-cart/${customerId}`),
      );
      return response.data;
    } catch (error) {
      this.handleHttpError(
        error as AxiosError,
        `deleteAllCart for customer ${customerId}`,
      );
    }
  }

  async createOrder(
    userId: string,
    paymentMethod: string,
    orderData: any,
    shippingAddress: string,
    checkoutSessionId: string,
  ): Promise<any> {
    const targetUrl = `${this.orderServiceUrl}/checkout/create-order`;
    try {
      this.logger.log(`Gateway: Forwarding createOrder request for user ${userId} to ${targetUrl}`);
      const response = await firstValueFrom(
        this.httpService.post(targetUrl, {
          userId,
          paymentMethod,
          orderData,
          shippingAddress,
          checkoutSessionId,
        }),
      );
      this.logger.log(`Gateway: Received response from Order Service for createOrder: ${response.status}`);
      return response.data;
    } catch (error) {
      this.handleHttpError(error as AxiosError, `createOrder to ${targetUrl}`);
    }
  }

  async updatePaymentStatus(orderId: number, status: string): Promise<any> {
    const targetUrl = `${this.orderServiceUrl}/checkout/orders/${orderId}/payment-status`;
    try {
      this.logger.log(`Gateway: Forwarding updatePaymentStatus request for order ${orderId} to ${targetUrl}`);
      const response = await firstValueFrom(
        this.httpService.patch(targetUrl, { status }),
      );
      this.logger.log(`Gateway: Received response from Order Service for updatePaymentStatus: ${response.status}`);
      return response.data;
    } catch (error: any) {
      this.handleHttpError(error as AxiosError, `updatePaymentStatus for order ${orderId} to ${targetUrl}`);
    }
  }

  async updatePaymentStatusBySessionId(sessionId: string, status: string): Promise<any> {
    const targetUrl = `${this.orderServiceUrl}/checkout/sessions/${sessionId}/payment-status`;
    try {
      this.logger.log(`Gateway: Forwarding updatePaymentStatusBySessionId request for session ${sessionId} to ${targetUrl}`);
      const response = await firstValueFrom(
        this.httpService.patch(targetUrl, { status }),
      );
      this.logger.log(`Gateway: Received response from Order Service for updatePaymentStatusBySessionId: ${response.status}`);
      return response.data;
    } catch (error: any) {
      this.handleHttpError(error as AxiosError, `updatePaymentStatusBySessionId for session ${sessionId} to ${targetUrl}`);
    }
  }
}
