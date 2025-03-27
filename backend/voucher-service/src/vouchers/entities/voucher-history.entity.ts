import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('VoucherHistories')
export class VoucherHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'VoucherID', type: 'int', nullable: true })
  VoucherID: number;

  @Column({ name: 'UserID', type: 'int', nullable: true }) 
  UserID: number;

  @Column({ name: 'UseDate', type: 'timestamptz', nullable: true })
  UseDate: Date;

  @CreateDateColumn({ name: 'CreatedAt' }) 
  CreatedAt: Date;

  @UpdateDateColumn({ name: 'UpdatedAt' }) 
  UpdatedAt: Date;
}
