import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { VoucherConditionType } from '../../common/enums/voucher-condition-type.enum';
  import { VoucherActionType } from '../../common/enums/voucher-action-type.enum';
  
  @Entity({ name: 'Vouchers' })
  export class Voucher {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'varchar', length: 255 })
    name: string;
  
    @Column({ type: 'text', nullable: true })
    description?: string;
  
    @Column({ type: 'timestamp with time zone' })
    starts_at: Date;
  
    @Column({ type: 'timestamp with time zone' })
    ends_at: Date;
  
    @Column({ type: 'varchar', length: 50, unique: true })
    code: string;
  
    @Column({ type: 'int', default: 1 })
    per_customer_limit: number;
  
    @Column({ type: 'int', default: 100 })
    total_usage_limit: number;
  
    @Column({ type: 'int' }) // Should be initialized based on total_usage_limit
    total_uses_left?: number;

    @Column({
      type: 'enum',
      enum: VoucherConditionType,
      default: VoucherConditionType.NONE,
    })
    condition_type: VoucherConditionType;
  
    @Column({ type: 'int', nullable: true })
    min_order_amount?: number;
  
    @Column({ type: 'int', nullable: true })
    min_products?: number;
  
    @Column('int', { array: true, nullable: true })
    product_ids?: number[]; // IDs of specific products
  
    @Column({ type: 'enum', enum: VoucherActionType, default: VoucherActionType.FIXED_AMOUNT })
    action_type: VoucherActionType;
  
    @Column({ type: 'int', nullable: true })
    discount_amount?: number;
  
    @Column({ type: 'int', nullable: true })
    discount_percentage?: number;
  
    @Column({ type: 'int', nullable: true })
      free_shipping_max?: number;
  
    @Column({ type: 'int', nullable: true })
      buy_x_amount?: number;
  
    @Column({ type: 'int', nullable: true })
      get_y_amount?: number;
  
    @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  }