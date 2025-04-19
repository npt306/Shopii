import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from 'typeorm';
import { OrderItemEntity } from './orderItem.entity';

@Entity('Orders')
export class OrderEntity {
  @PrimaryGeneratedColumn({ name: 'OrderID' })
  orderId: number;

  @Column({ name: 'CustomerID' })
  customerId: number;

  @Column({ name: 'ShopID' })
  shopId: number;

  @Column('text', { name: 'ShopName' })
  shopName: string;

  @Column('text', { name: 'Message' })
  message: string;

  @Column('integer', { name: 'TotalPrice' })
  totalPrice: number;

  @Column('text', { name: 'PaymentMethod' })
  paymentMethod: string;

  @Column('boolean', { name: 'PaymentStatus', default: false })
  paymentStatus: boolean;

  @Column('text', { name: 'OrderStatus' })
  orderStatus: string;

  @Index()
  @Column({ type: 'varchar', length: 50, nullable: true, name: 'CheckoutSessionID' })
  checkoutSessionId?: string;

  @Column({ type: 'text', nullable: true, name: 'AddressShipping' })
  addressShipping: string;

  @OneToMany(() => OrderItemEntity, (item) => item.order)
  orderItems: OrderItemEntity[];
}
