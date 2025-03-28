// user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { Account } from './Account.entity';

@Entity('Users')
export class User {
  @PrimaryColumn()
  id: number;

  @OneToOne(() => Account, account => account.user, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' }) // The foreign key column is also 'id'
  account: Account;

  @Column({ nullable: true, type: 'text' }) // Specify type for JSON strings
  FollowingShops: string;

  @Column({ nullable: true, type: 'text' })
  Cart: string;

  @Column({ nullable: true, type: 'text' })
  Order: string;

  @Column({ nullable: true, type: 'text' })
  Review: string;

  @CreateDateColumn()
  CreatedAt: Date;

  @UpdateDateColumn()
  UpdatedAt: Date;
}