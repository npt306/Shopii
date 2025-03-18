import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('AdminOtps')
export class AdminOtp {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  email: string;
  
  @Column()
  otp: string;
  
  @Column()
  expiresAt: Date;
  
  @Column({ default: false })
  used: boolean;
  
  @CreateDateColumn()
  createdAt: Date;
}