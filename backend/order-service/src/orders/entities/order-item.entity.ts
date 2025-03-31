import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('OrderItems')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @Column()
  orderId: number;

  @Column()
  productId: number; // Reference to ProductID in Products table

  @Column()
  productTypeId: number; // Reference to ProductDetailTypeID

  @Column({ type: 'varchar', length: 255 })
  productName: string; // Store name at time of order

  @Column({ type: 'varchar', length: 100, nullable: true })
  variation1?: string; // e.g., Color

  @Column({ type: 'varchar', length: 100, nullable: true })
  variation2?: string; // e.g., Size

  @Column()
  quantity: number;

  @Column('decimal', { precision: 12, scale: 2 })
  priceAtTime: number; // Price per item at the time of order

  @Column({ type: 'varchar', length: 255, nullable: true })
  productImage?: string; // Store main image URL

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}