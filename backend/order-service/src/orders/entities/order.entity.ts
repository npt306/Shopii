import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { OrderStatus, PaymentMethod, PaymentStatus } from '../../common/enums';
import { OrderItem } from './order-item.entity';

@Entity('Orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  customerId: number; // Link to the AccountId in Accounts table

  // Store address details directly or use an addressId if addresses are managed centrally
  @Column('text')
  shippingAddress: string; // Consider storing as JSON or separate fields

  @Column('decimal', { precision: 12, scale: 2 })
  totalAmount: number; // Total amount including shipping, after discounts

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  shippingFee: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  discountAmount: number; // Amount reduced by vouchers/promotions

  @Column({ type: 'varchar', length: 50, nullable: true })
  voucherCode?: string; // Store applied voucher code

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING_PAYMENT })
  orderStatus: OrderStatus;

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Index()
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string; // Notes from the customer

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}