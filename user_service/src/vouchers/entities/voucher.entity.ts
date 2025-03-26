import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('Vouchers')
export class Voucher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamptz' })
  starts_at: Date;

  @Column({ type: 'timestamptz' })
  ends_at: Date;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 50 })
  code: string;

  @Column()
  total_uses_left: number;

  @Column()
  per_customer_limit: number;

  @Column()
  total_usage_limit: number;

  // @CreateDateColumn()
  // created_at: Date;

  // @UpdateDateColumn()
  // updated_at: Date;
}
