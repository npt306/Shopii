import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity('OrderItems')
export class OrderItemEntity {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'OrderID' })
  orderId: number;

  @Column({ name: 'ProductTypeID' })
  productTypeId: number;

  @Column('text', { nullable: true, name: 'Image' })
  image: string;

  @Column('text', { nullable: true, name: 'Type_1' })
  type_1: string;

  @Column('text', { nullable: true, name: 'Type_2' })
  type_2: string;

  @Column({ name: 'Quantity' })
  quantity: number;

  @Column({ name: 'Price' })
  price: number;

  @ManyToOne(() => OrderEntity, (order) => order.orderItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'OrderID' })
  order: OrderEntity;
}
