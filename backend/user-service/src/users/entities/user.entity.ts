import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';

@Entity('Accounts')
export class User {
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

}
