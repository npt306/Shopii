import { Controller, Get, Post, Body, Param, Patch, ParseIntPipe, Logger } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderData } from './dto/create-order.dto';

@Controller('checkout')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(private readonly orderService: OrderService) {}

  @Post('/create-order')
  createOrder(
    @Body()
    payload: {
      userId: string;
      checkoutSessionId: string;
      orderData: OrderData[];
      shippingAddress: string;
      paymentMethod: string;
    },
  ) {
    this.logger.log(`Order Service: Received createOrder payload: ${JSON.stringify(payload)}`);
    return this.orderService.createOrder(
      payload.userId,
      payload.orderData,
      payload.shippingAddress,
      payload.paymentMethod,
      payload.checkoutSessionId
    );
  }

  @Get('/user-orders/:userId')
  getUserOrders(@Param('userId') userId: string) {
    return this.orderService.getUserOrders(userId);
  }

  @Patch('/orders/:orderId/payment-status')
  async updatePaymentStatus(
    @Param('orderId', ParseIntPipe) orderId: number,
    @Body('status') status: string,
  ) {
    this.logger.log(`Order Service: Received updatePaymentStatus for order ${orderId} with status: ${status}`);
    return this.orderService.updatePaymentStatus(orderId, status);
  }

  @Patch('/sessions/:sessionId/payment-status')
  async updatePaymentStatusBySessionId(
    @Param('sessionId') sessionId: string,
    @Body('status') status: string,
  ) {
    this.logger.log(`Order Service: Received updatePaymentStatusBySessionId for session ${sessionId} with status: ${status}`);
    return this.orderService.updatePaymentStatusBySessionId(sessionId, status);
  }
}
