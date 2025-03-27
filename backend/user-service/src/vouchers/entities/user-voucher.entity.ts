import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('UserVouchers')
export class UserVoucher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  VoucherId: number;

  @Column()
  OwnerId: number;
  
  @Column({ type: 'timestamptz' })
  ExpDate: Date;
  
  @Column()
  UsingTimeLeft: number;

  @CreateDateColumn({ name: 'CreatedAt' }) 
  CreatedAt: Date;

  @UpdateDateColumn({ name: 'UpdatedAt' }) 
  UpdatedAt: Date;

}
