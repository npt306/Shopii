import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';

@Entity('SellerBankAccounts')
@Index(['sellerId', 'isDefault'])
export class SellerBankAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'int' })
  sellerId: number;

  @Column({ type: 'varchar', length: 100 })
  bankName: string;

  @Column({ type: 'varchar', length: 50 })
  accountNumber: string;

  @Column({ type: 'varchar', length: 150 })
  accountHolderName: string;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
