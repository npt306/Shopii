import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto, OrderData } from './dto/create-order.dto';
import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/orderItem.entity';
import { PaymentMethod, PaymentStatus, OrderStatus } from '../common/enums';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
  ) {}

  async createOrder(
    userId: string,
    ordersData: OrderData[],
    shippingAddress: string,
    paymentMethod: string,
  ) {
    try {
      // Create a new order for each shop
      const orderPromises = ordersData.map(async (shopOrder) => {
        // Create the order entity
        const newOrder = new OrderEntity();
        newOrder.customerId = parseInt(userId);
        newOrder.shopId = parseInt(shopOrder.shopId);
        newOrder.shopName = shopOrder.shopName;
        newOrder.message = shopOrder.message;
        newOrder.totalPrice = shopOrder.totalPrice;
        newOrder.paymentMethod = paymentMethod;
        newOrder.paymentStatus = paymentMethod === PaymentMethod.COD ? PaymentStatus.PENDING : PaymentStatus.PENDING;
        newOrder.orderStatus = paymentMethod === PaymentMethod.COD ? OrderStatus.PROCESSING : OrderStatus.PENDING_PAYMENT;
        newOrder.addressShipping = shippingAddress;

        // Save the order to get the orderId
        const savedOrder = await this.orderRepository.save(newOrder);

        // Create order items for each product
        const orderItems = shopOrder.products.map((product) => {
          const orderItem = new OrderItemEntity();
          orderItem.orderId = savedOrder.orderId;
          orderItem.productTypeId = parseInt(product.productTypeId);
          orderItem.image = product.image;
          orderItem.type_1 = product.type_1 || '';
          orderItem.type_2 = product.type_2 || '';
          orderItem.quantity = product.quantity;
          orderItem.price = product.price;
          orderItem.order = savedOrder;
          return orderItem;
        });

        // Save all order items
        await this.orderItemRepository.save(orderItems);
        this.logger.log(
          `Created ${orderItems.length} order items for order: ${savedOrder.orderId}`,
        );

        return savedOrder;
      });

      // Wait for all orders to be processed
      const createdOrders = await Promise.all(orderPromises);
      this.logger.log(
        `Successfully processed all ${createdOrders.length} shop orders`,
      );

      return {
        success: true,
        message: 'Orders created successfully',
        data: createdOrders.map((order) => order.orderId),
      };
    } catch (error) {
      this.logger.error(`Error creating orders: ${error.message}`, error.stack);
      return {
        success: false,
        message: 'Failed to create orders',
        error: error.message,
      };
    }
  }

  async getUserOrders(userId: string) {
    try {
      const customerId = parseInt(userId);

      const orders = await this.orderRepository.find({
        where: { customerId },
        relations: ['orderItems'],
        order: {
          orderId: 'DESC',
        },
      });

      if (orders.length === 0) {
        this.logger.log(`No orders found for user ID: ${customerId}`);
        return {
          success: true,
          message: 'No orders found for this user',
          data: [],
        };
      }

      return {
        success: true,
        message: 'Orders retrieved successfully',
        data: orders,
      };
    } catch (error) {
      this.logger.error(
        `Error retrieving user orders: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: 'Failed to retrieve user orders',
        error: error.message,
      };
    }
  }

  async updatePaymentStatus(orderId: number, status: PaymentStatus): Promise<OrderEntity> {
    this.logger.log(`Updating payment status for order ${orderId} to ${status}`);
    const order = await this.orderRepository.findOne({ where: { orderId } });

    if (!order) {
      this.logger.error(`Order with ID ${orderId} not found for payment status update.`);
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    order.paymentStatus = status;
    if (status === PaymentStatus.PAID && order.paymentMethod === PaymentMethod.VNPAY) {
        order.orderStatus = OrderStatus.PROCESSING;
    } else if (status === PaymentStatus.FAILED) {
        order.orderStatus = OrderStatus.CANCELLED;
    }

    return this.orderRepository.save(order);
  }
}
