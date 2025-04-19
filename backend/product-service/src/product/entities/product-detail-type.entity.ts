import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Product } from './product.entity';
import { ProductDimensions } from './product-dimensions.entity';

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

  @OneToOne(() => ProductDimensions, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'Dimension' })
  Dimension: ProductDimensions;

  @ManyToOne(() => Product, (product) => product.details, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'ProductID' })
  product: Product;
}
