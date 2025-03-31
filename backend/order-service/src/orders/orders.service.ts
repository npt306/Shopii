import { Injectable, NotFoundException, InternalServerErrorException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderPaymentStatusDto } from './dto/update-order-payment-status.dto';
import { OrderStatus, PaymentStatus } from '../common/enums';
import { Cart } from '../carts/entities/cart.entity';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const { customerId, items, ...orderData } = createOrderDto;

    if (!items || items.length === 0) {
      throw new BadRequestException('Order must contain at least one item.');
    }

    const queryRunner = this.ordersRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newOrder = queryRunner.manager.create(Order, {
        ...orderData,
        customerId,
        orderStatus: OrderStatus.PENDING_PAYMENT, // Initial status
        paymentStatus: PaymentStatus.PENDING,
      });

      const savedOrder = await queryRunner.manager.save(Order, newOrder);

      const orderItems = items.map(itemDto =>
        queryRunner.manager.create(OrderItem, {
          ...itemDto,
          orderId: savedOrder.id,
        }),
      );

      await queryRunner.manager.save(OrderItem, orderItems);

      // Clear cart items after order creation
      const productTypeIds = items.map(item => item.productTypeId);
      await queryRunner.manager.delete(Cart, { customerId, productTypeId: In(productTypeIds) });
      this.logger.log(`Cleared cart items for customer ${customerId}, productTypeIds: ${productTypeIds.join(', ')}`);


      await queryRunner.commitTransaction();
      this.logger.log(`Created order ${savedOrder.id} for customer ${customerId}`);

      // Refetch the order with items to return
      return this.getOrderById(savedOrder.id);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to create order for customer ${customerId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to create order.');
    } finally {
      await queryRunner.release();
    }
  }

  async updatePaymentStatus(orderId: number, updateDto: UpdateOrderPaymentStatusDto): Promise<Order> {
    const order = await this.ordersRepository.findOneBy({ id: orderId });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found.`);
    }

    // Prevent updating status if it's not pending or already matches
    if (order.paymentStatus !== PaymentStatus.PENDING) {
        if (order.paymentStatus === updateDto.status) {
            this.logger.log(`Order ${orderId} payment status already set to ${updateDto.status}. No update needed.`);
            return order;
        } else {
             throw new BadRequestException(`Cannot update payment status for order ${orderId} from ${order.paymentStatus} to ${updateDto.status}.`);
        }
    }

    order.paymentStatus = updateDto.status;

    // Update order status based on payment
    if (updateDto.status === PaymentStatus.PAID) {
      order.orderStatus = OrderStatus.PROCESSING; // Move to processing if paid
      // TODO: Potentially trigger notification to seller
    } else if (updateDto.status === PaymentStatus.FAILED) {
      order.orderStatus = OrderStatus.CANCELLED; // Or keep PENDING_PAYMENT and let user retry? Decide based on flow.
      // TODO: Potentially trigger notification to user/seller
    }

    try {
      await this.ordersRepository.save(order);
      this.logger.log(`Updated payment status for order ${orderId} to ${updateDto.status}. Order status set to ${order.orderStatus}`);
      return order;
    } catch (error) {
      this.logger.error(`Failed to update payment status for order ${orderId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to update order payment status.');
    }
  }

  async getOrderById(orderId: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['items'], // Include order items
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found.`);
    }
    return order;
  }

  async getOrdersByCustomerId(customerId: number): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { customerId },
      relations: ['items'],
      order: { createdAt: 'DESC' }, // Show newest orders first
    });
  }

  // TODO: updateOrderStatus (for seller/admin), cancelOrder, etc
}