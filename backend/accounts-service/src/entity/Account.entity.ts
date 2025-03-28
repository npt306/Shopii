// accounts.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { User } from './User.entity';
import { Seller } from './seller.entity';
import { Address } from './address.entity';

@Entity('Accounts')
export class Account {
  @PrimaryGeneratedColumn()
  AccountId: number;

  @Column({ unique: true })
  Email: string;

  @Column()
  Username: string;

  @Column({ nullable: true })
  Avatar: string;

  @Column({ type: 'date' })
  DoB: Date;

  @Column({ nullable: true })
  PhoneNumber: string;

  @Column({ nullable: true })
  Sex: boolean;

  @Column()
  Status: string;
  
  @CreateDateColumn()
  CreatedAt: Date;

  @UpdateDateColumn()
  UpdatedAt: Date;

  // Establish a one-to-one relation with User
  @OneToOne(() => User, user => user.account, { 
    cascade: true, 
    onDelete: 'CASCADE'
  })
  user: User;

  @OneToOne(() => Seller, (seller) => seller.account, {
    cascade: true,
    onDelete: 'CASCADE',
    nullable: true
  })
  seller: Seller;

  @OneToOne(() => Address, (address) => address.account, {
    cascade: true,
    onDelete: 'CASCADE',
    nullable: true
  })
  address: Address;
}
