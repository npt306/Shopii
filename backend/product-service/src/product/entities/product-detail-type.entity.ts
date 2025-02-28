import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('ProductDetailType')
export class ProductDetailType {
  @PrimaryGeneratedColumn()
  ProductDetailTypeID: number;

  @Column()
  ProductID: number;

  @Column({ length: 50, nullable: true })
  Type_1: string;

  @Column({ length: 50, nullable: true })
  Type_2: string;

  @Column({ type: 'text' })
  Image: string;

  @Column()
  Price: number;

  @Column()
  Quantity: number;

  @Column()
  Dimension: number;

  @ManyToOne(() => Product, (product) => product.details)
  @JoinColumn({ name: 'ProductID' })
  product: Product;
}
