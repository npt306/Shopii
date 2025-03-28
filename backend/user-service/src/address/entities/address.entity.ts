import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Addresses')
export class Address {
  @PrimaryGeneratedColumn()
  AddressId: number;

  @Column({ nullable: false }) // Ensure this is set to false
  FullName: string;

  @Column({ nullable: false })
  PhoneNumber: string;

  @Column({ nullable: false })
  Province: string;

  @Column({ nullable: false })
  District: string;

  @Column({ nullable: false })
  Ward: string;

  @Column({ nullable: false })
  SpecificAddress: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  CreatedAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  UpdatedAt: Date;

  @Column({ nullable: false })
  AccountId: number;

  @Column({ default: false })
  isDefault: boolean;
}