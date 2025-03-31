import { Controller, Post, Get, Patch, Param, Body, ParseIntPipe, UsePipes, ValidationPipe, Logger } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderPaymentStatusDto } from './dto/update-order-payment-status.dto';

@Controller('orders')
export class OrdersController {
    private readonly logger = new Logger(OrdersController.name);

    constructor(private readonly ordersService: OrdersService) {}

    @Post()
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    create(@Body() createOrderDto: CreateOrderDto) {
        this.logger.log(`Received request to create order for customer ${createOrderDto.customerId}`);
        return this.ordersService.createOrder(createOrderDto);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        this.logger.log(`Received request to get order details for ID ${id}`);
        return this.ordersService.getOrderById(id);
    }

    @Get('customer/:customerId')
    findByCustomer(@Param('customerId', ParseIntPipe) customerId: number) {
        this.logger.log(`Received request to get orders for customer ${customerId}`);
        return this.ordersService.getOrdersByCustomerId(customerId);
    }

    @Patch(':id/payment-status') // Endpoint for payment service to call
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    updatePaymentStatus(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateOrderPaymentStatusDto,
    ) {
        this.logger.log(`Received request to update payment status for order ${id} to ${updateDto.status}`);
        return this.ordersService.updatePaymentStatus(id, updateDto);
    }
}