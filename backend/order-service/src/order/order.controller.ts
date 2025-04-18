import { Controller, Get, Post, Body, Param, Patch, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderData } from './dto/create-order.dto';
import { PaymentStatus } from '../common/enums';

@Controller('checkout')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('/create-order')
  createOrder(
    @Body()
    payload: {
      userId: string;
      orderData: OrderData[];
      shippingAddress: string;
      paymentMethod: string;
    },
  ) {
    return this.orderService.createOrder(
      payload.userId,
      payload.orderData,
      payload.shippingAddress,
      payload.paymentMethod,
    );
  }

  @Get('/user-orders/:userId')
  getUserOrders(@Param('userId') userId: string) {
    return this.orderService.getUserOrders(userId);
  }

  @Patch('/orders/:orderId/payment-status')
  @HttpCode(HttpStatus.OK)
  updatePaymentStatus(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body('status') status: PaymentStatus,
  ) {
    return this.orderService.updatePaymentStatus(orderId, status);
  }
}
