import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderData } from './dto/create-order.dto';

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
    },
  ) {
    return this.orderService.createOrder(
      payload.userId,
      payload.orderData,
      payload.shippingAddress,
    );
  }

  @Get('/user-orders/:userId')
  getUserOrders(@Param('userId') userId: string) {
    return this.orderService.getUserOrders(userId);
  }
}
