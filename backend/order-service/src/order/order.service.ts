import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto, OrderData } from './dto/create-order.dto';
import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/orderItem.entity';

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
        newOrder.paymentMethod = 'COD';
        newOrder.paymentStatus = shopOrder.isPaid;
        newOrder.orderStatus = 'Pending';
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
}
