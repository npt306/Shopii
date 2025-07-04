import { Controller, Post, Get, Param, Body, Patch, ParseIntPipe } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { OrderService } from './order.service';

@Controller('/order')
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly httpService: HttpService,
  ) {}

  @Post('/carts/add-to-cart')
  async addToCart(@Body() addToCartDto: any): Promise<any> {
    return this.orderService.addToCart(addToCartDto);
  }

  @Post('/carts/delete-from-cart')
  async deleteFromCart(@Body() deleteFromCartDto: any): Promise<any> {
    return this.orderService.deleteFromCart(deleteFromCartDto);
  }

  @Post('/carts/update-cart')
  async updateCart(@Body() updateCartDto: any): Promise<any> {
    return this.orderService.updateCart(updateCartDto);
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

  @Post('/checkout/create-order')
  async createOrder(
    @Body()
    payload: {
      userId: string;
      checkoutSessionId: string;
      orderData: any;
      shippingAddress: string;
      paymentMethod: string;
    },
  ): Promise<any> {
    return this.orderService.createOrder(
      payload.userId,
      payload.paymentMethod,
      payload.orderData,
      payload.shippingAddress,
      payload.checkoutSessionId,
    );
  }

  @Get('/checkout/user-orders/:userId')
  async getUserOrder(@Param('userId') id: number) {
    try {
      const response = await this.httpService
        .get(`${process.env.ORDER_SERVICE_URL}/checkout/user-orders/${id}`)
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

  @Patch('/orders/:orderId/payment-status')
  async updatePaymentStatus(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body() payload: { status: string },
  ) {
    return this.orderService.updatePaymentStatus(orderId, payload.status);
  }

  @Patch('/sessions/:sessionId/payment-status')
  async updatePaymentStatusBySessionId(
    @Param('sessionId') sessionId: string,
    @Body() payload: { status: string },
  ) {
    return this.orderService.updatePaymentStatusBySessionId(sessionId, payload.status);
  }
}
