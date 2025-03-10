import { 
  Entity, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  OneToOne, 
  PrimaryColumn, 
  JoinColumn 
} from 'typeorm';
import { Account } from './Account.entity';

@Entity('Sellers')
export class Seller {
  @PrimaryColumn()
  id: number;

  @OneToOne(() => Account, account => account.seller, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id', referencedColumnName: 'AccountId' })
  account: Account;

  @Column({ nullable: false })
  ShopName: string;

  @Column({ default: 0 })
  TaxCode: number;

  @Column({ default: 'Individual' })
  SellerType: string;

  @Column({ type: 'varchar', array: true, nullable: true })
  Email: string[];

  @Column({ default: 0 })
  Followers: number;

  @CreateDateColumn()
  CreatedAt: Date;

  @UpdateDateColumn()
  UpdatedAt: Date;
}
