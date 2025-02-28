// src/entities/product.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { ProductClassificationType } from './product-classification-type.entity';
import { ProductDetailType } from './product-detail-type.entity';
import { ProductStatus } from '../../common/productStatus.enum';

@Entity('Products')
export class Product {
  @PrimaryGeneratedColumn()
  ProductID: number;

  @Column({ nullable: true })
  SellerID: number;

  @Column({ length: 255, nullable: true })
  Name: string;

  @Column({ type: 'text', nullable: true })
  Description: string;

  @Column({ type: 'integer', array: true, nullable: true })
  Categories: number[];

  @Column({ type: 'varchar', array: true, nullable: true })
  Images: string[];

  @Column({ nullable: true })
  SoldQuantity: number;

  @Column({ type: 'numeric', nullable: true })
  Rating: number;

  @Column({
    name: 'Status',
    type: 'enum',
    enum: ProductStatus,
    nullable: true,
  })
  status: ProductStatus;

  @Column({ type: 'timestamp with time zone', nullable: true })
  CreatedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  UpdatedAt: Date;

  @Column({ length: 255, nullable: true })
  CoverImage: string;

  @Column({ length: 255, nullable: true })
  Video: string;

  @Column({ nullable: true })
  Quantity: number;

  @Column({ nullable: true })
  Reviews: number;

  @OneToMany(
    () => ProductClassificationType,
    (classification) => classification.product,
  )
  classifications: ProductClassificationType[];

  @OneToMany(() => ProductDetailType, (detail) => detail.product)
  details: ProductDetailType[];
}
