import { Injectable, Logger, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
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
    paymentMethod: string,
    checkoutSessionId: string,
  ) {
    const customerId = parseInt(userId, 10);
    if (isNaN(customerId)) {
        this.logger.error(`Invalid userId received: ${userId}`);
        throw new BadRequestException(`Invalid user ID: ${userId}`);
    }

    try {
      // Create a new order for each shop
      const orderPromises = ordersData.map(async (shopOrder) => {
        // Create the order entity
        const newOrder = new OrderEntity();
        newOrder.customerId = customerId;

        const shopIdNum = parseInt(shopOrder.shopId, 10);
        if (isNaN(shopIdNum)) {
            this.logger.error(`Invalid ShopID string received: ${shopOrder.shopId}`);
            throw new BadRequestException(`Invalid ShopID format: ${shopOrder.shopId}`);
        }
        newOrder.shopId = shopIdNum;
        newOrder.shopName = shopOrder.shopName;
        newOrder.message = shopOrder.message;
        newOrder.totalPrice = shopOrder.totalPrice;
        newOrder.paymentMethod = paymentMethod;
        newOrder.paymentStatus = false;
        newOrder.checkoutSessionId = checkoutSessionId;
        newOrder.orderStatus = 'Pending'; // Start all orders as 'Pending' 
        newOrder.addressShipping = shippingAddress;

        // Save the order to get the orderId
        const savedOrder = await this.orderRepository.save(newOrder);
        this.logger.log(`Saved order ${savedOrder.orderId} for shop ${savedOrder.shopId}`);

        // Create order items for each product
        const orderItems = shopOrder.products.map((product) => {
          const orderItem = new OrderItemEntity();
          orderItem.orderId = savedOrder.orderId;

          const productTypeIdNum = parseInt(product.productTypeId, 10);
          if (isNaN(productTypeIdNum)) {
              this.logger.error(`Invalid ProductTypeID string received: ${product.productTypeId} for order ${savedOrder.orderId}`);
              throw new BadRequestException(`Invalid ProductTypeID format: ${product.productTypeId}`);
          }
          orderItem.productTypeId = productTypeIdNum;
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
        `Successfully processed all ${createdOrders.length} shop orders for checkout session ${checkoutSessionId}`,
      );

      return {
        success: true,
        message: 'Orders created successfully',
        data: createdOrders.map((order) => order.orderId),
      };
    } catch (error) {
      this.logger.error(`Error creating orders for session ${checkoutSessionId}: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
          throw error;
      }
      return {
        success: false,
        message: `Failed to create orders: ${error.message}`,
        error: error.message,
      };
    }
  }

  async getUserOrders(userId: string) {
    const customerId = parseInt(userId, 10);
    if (isNaN(customerId)) {
        this.logger.error(`Invalid userId for getUserOrders: ${userId}`);
        throw new BadRequestException(`Invalid user ID: ${userId}`);
    }
    try {
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

      this.logger.log(`Retrieved ${orders.length} orders for user ID: ${customerId}`);
      return {
        success: true,
        message: 'Orders retrieved successfully',
        data: orders,
      };
    } catch (error) {
      this.logger.error(
        `Error retrieving orders for user ID ${customerId}: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: 'Failed to retrieve user orders',
        error: error.message,
      };
    }
  }

  async updatePaymentStatus(orderId: number, status: string): Promise<OrderEntity> {
    this.logger.log(`Updating payment status for order ${orderId} to ${status}`);
    const order = await this.orderRepository.findOne({ where: { orderId } });

    if (!order) {
      this.logger.error(`Order with ID ${orderId} not found for payment status update.`);
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    order.paymentStatus = status === 'Paid';

    if (order.paymentStatus && order.orderStatus === 'Pending') {
        order.orderStatus = 'Processing';
        this.logger.log(`Order status for ${orderId} updated to Processing due to payment.`);
    } else if (!order.paymentStatus && order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Failed Delivery') {
        this.logger.warn(`Payment status for order ${orderId} set to unpaid/failed. Current order status: ${order.orderStatus}`);
    }

    try {
        const updatedOrder = await this.orderRepository.save(order);
        this.logger.log(`Successfully updated payment status for order ${orderId}`);
        return updatedOrder;
    } catch (error) {
        this.logger.error(`Failed to save updated payment status for order ${orderId}: ${error.message}`, error.stack);
        throw new InternalServerErrorException('Could not update payment status.');
    }
  }

  async updatePaymentStatusBySessionId(sessionId: string, status: string): Promise<{ updatedCount: number }> {
    this.logger.log(`Order Service: Attempting to update payment status for session ${sessionId} to ${status}`);

    const orders = await this.orderRepository.find({ where: { checkoutSessionId: sessionId } });

    if (!orders || orders.length === 0) {
      this.logger.warn(`Order Service: No orders found for checkout session ID ${sessionId}. Cannot update status.`);
      return { updatedCount: 0 };
    }
    this.logger.log(`Order Service: Found ${orders.length} orders for session ${sessionId}.`);

    const paymentStatusBool = status === 'Paid';
    const newOrderStatusUpdates: Partial<OrderEntity> = { paymentStatus: paymentStatusBool };

    if (paymentStatusBool) {
        newOrderStatusUpdates.orderStatus = 'Processing';
    }

    try {
        const condition = paymentStatusBool ? { checkoutSessionId: sessionId, orderStatus: 'Pending' } : { checkoutSessionId: sessionId };
        const updateData = paymentStatusBool ? newOrderStatusUpdates : { paymentStatus: paymentStatusBool };

        const updateResult = await this.orderRepository.update(condition, updateData);

        if (paymentStatusBool) {
            this.logger.log(`Order Service: Updated status to Processing/Paid for ${updateResult.affected || 0} pending orders in session ${sessionId}`);
        } else {
            this.logger.log(`Order Service: Updated payment status to failed for ${updateResult.affected || 0} out of ${orders.length} orders in session ${sessionId}`);
        }

        return { updatedCount: updateResult.affected || 0 };
    } catch (error) {
        this.logger.error(`Order Service: Failed to update orders for session ${sessionId}: ${error.message}`, error.stack);
        return { updatedCount: 0 };
    }
  }
}
