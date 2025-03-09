import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('sellers')
export class Seller {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'Default Shop Name' })
  shopName: string;

  @Column({ default: 0 })
  products: number;

  @Column({ default: 0 })
  revenue: number;

  @Column({ default: 'Basic' })
  sellerType: string;

  @Column({ default: 'Standard Shipping' })
  shippingMethod: string;

  @Column({ nullable: true })
  taxCode: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  email: string;

  @Column({ default: 0 })
  followers: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
