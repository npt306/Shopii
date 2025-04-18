import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { OrderItemEntity } from './orderItem.entity';
import { PaymentMethod, PaymentStatus, OrderStatus } from '../../common/enums';

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

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    name: 'PaymentMethod',
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
    name: 'PaymentStatus',
  })
  paymentStatus: PaymentStatus;

  @Column({ type: 'enum', enum: OrderStatus, name: 'OrderStatus' })
  orderStatus: OrderStatus;

  @Column({ type: 'text', nullable: true, name: 'AddressShipping' })
  addressShipping: string;

  @OneToMany(() => OrderItemEntity, (item) => item.order)
  orderItems: OrderItemEntity[];
}
