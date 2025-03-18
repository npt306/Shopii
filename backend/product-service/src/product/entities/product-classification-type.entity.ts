import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('ProductClassificationType')
export class ProductClassificationType {
  @PrimaryColumn()
  ProductID: number;

  @PrimaryColumn()
  ClassTypeName: string;

  @Column({ nullable: true })
  Level: number;

  @ManyToOne(() => Product, (product) => product.classifications)
  @JoinColumn({ name: 'ProductID' })
  product: Product;
}
