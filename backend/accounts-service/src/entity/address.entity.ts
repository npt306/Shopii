import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
} from 'typeorm';

import { Account } from './Account.entity';

@Entity('Addresses')
export class Address {
    @PrimaryGeneratedColumn()
    AddressId: number;

    @Column({ length: 100 })
    FullName: string;

    @Column({ length: 15 })
    PhoneNumber: string;

    @Column({ length: 100 })
    Province: string;

    @Column({ length: 100 })
    District: string;

    @Column({ length: 100 })
    Ward: string;

    @Column({ length: 255 })
    SpecificAddress: string;

    @CreateDateColumn()
    CreatedAt: Date;

    @UpdateDateColumn()
    UpdatedAt: Date;

    @OneToOne(() => Account, account => account.address, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'AccountId', referencedColumnName: 'AccountId' })
    account: Account;

    @Column()
    AccountId: number;

    @Column({ default: false })
    isDefault: boolean;
}
