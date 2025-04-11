import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
@Entity('SellerVouchers')
export class SellerVoucher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 5, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  name: string;

  @Column({
    type: 'varchar',
    length: 20,
    enum: ['shop_wide', 'product_specific'],
  })
  voucher_type: string;

  @Column({ type: 'varchar', length: 20, enum: ['percentage', 'fixed_amount'] })
  discount_type: string;

  @Column({ type: 'numeric' })
  discount_value: number;

  @Column({ type: 'numeric', default: 0 })
  min_order: number;

  @Column({ type: 'int' })
  max_usage: number;

  @Column({ type: 'int' })
  usage_per_user: number;

  @Column({ type: 'timestamp' })
  starts_at: Date;

  @Column({ type: 'timestamp' })
  ends_at: Date;

  @Column({ type: 'boolean', default: true })
  is_public: boolean;

  @CreateDateColumn({ name: 'CreatedAt' })
  CreatedAt: Date;

  @UpdateDateColumn({ name: 'UpdatedAt' })
  UpdatedAt: Date;

  @Column({ type: 'int', array: true, nullable: true })
  product_id: number[];

  @Column({ type: 'int' })
  sellerid: number;

  @Column({ type: 'int', default: 0 })
  used: number;
}
