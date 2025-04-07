import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Voucher } from './voucher.entity';

@Entity('UserVouchers')
export class UserVoucher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  VoucherId: number;

  @ManyToOne(() => Voucher)
  @JoinColumn({ name: 'VoucherId' })
  voucher: Voucher;

  @Column()
  OwnerId: number;
  
  @Column({ type: 'timestamptz' })
  ExpDate: Date;
  
  @Column()
  UsingTimeLeft: number;

  @Column()
  isfromshop: boolean;

  @CreateDateColumn({ name: 'CreatedAt' }) 
  CreatedAt: Date;

  @UpdateDateColumn({ name: 'UpdatedAt' }) 
  UpdatedAt: Date;
}
