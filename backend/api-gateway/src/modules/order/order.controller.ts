import { Controller, Post, Get, Param, Body, ParseIntPipe, Logger } from '@nestjs/common';
import { OrderService } from './order.service';

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

@Controller('order/')
export class OrderController {
  private readonly logger = new Logger(OrderController.name);

  constructor(private readonly orderService: OrderService) {}

  // Cart Endpoints
  @Post('/carts/add')
  async addToCart(@Body() addToCartDto: any): Promise<any> {
    this.logger.log(`Gateway: Received addToCart request`);
    return this.orderService.addToCart(addToCartDto);
  }

  @Post('/carts/delete')
  async deleteFromCart(@Body() deleteFromCartDto: any): Promise<any> {
     this.logger.log(`Gateway: Received deleteFromCart request`);
    return this.orderService.deleteFromCart(deleteFromCartDto);
  }

  @Post('/carts/update')
  async updateCart(@Body() updateCartDto: any): Promise<any> {
    this.logger.log(`Gateway: Received updateCart request`);
    return this.orderService.updateCart(updateCartDto);
  }

  @Get('/carts/delete-all/:customerId')
  async deletedAllCart(@Param('customerId', ParseIntPipe) id: number) {
     this.logger.log(`Gateway: Received deleteAllCart request for customer ${id}`);
    return this.orderService.deleteAllCart(id);
  }

  @Get('/carts/:customerId')
  async getCart(@Param('customerId', ParseIntPipe) id: number) {
    this.logger.log(`Gateway: Received getCart request for customer ${id}`);
    return this.orderService.getCart(id);
  }

  @Get('/carts/basic/:customerId')
  async getBasicCart(@Param('customerId', ParseIntPipe) id: number) {
     this.logger.log(`Gateway: Received getBasicCart request for customer ${id}`);
    return this.orderService.getBasicCart(id);
  }
}