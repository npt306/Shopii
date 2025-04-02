import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum PaymentStatus {
  PENDING = 'Pending',
  SUCCESS = 'Success',
  FAILED = 'Failed',
}

// Enum for Payout Status
export enum PaymentPayoutStatus {
  PENDING = 'Pending',        // Initial state, ready for payout processing
  PROCESSING = 'Processing',    // Payout attempt is in progress
  COMPLETED = 'Completed',      // Payout was successful
  FAILED = 'Failed',          // Payout attempt failed
  NOT_APPLICABLE = 'Not Applicable', // For failed payments that won't be paid out
}

@Entity('PaymentTransactions')
export class PaymentTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'varchar', length: 50 })
  orderId: string;

  @Index()
  @Column({ type: 'int', nullable: true }) // Nullable if seller info might not be immediately available
  sellerId: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100 })
  vnp_TxnRef: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  // --- Optional VNPay Details ---
  @Column({ type: 'varchar', length: 255, nullable: true })
  vnp_OrderInfo?: string;

  @Column({ type: 'varchar', length: 2, nullable: true })
  vnp_ResponseCode?: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  vnp_TransactionNo?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  vnp_BankCode?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  vnp_CardType?: string;

  @Column({ type: 'varchar', length: 14, nullable: true })
  vnp_PayDate?: string;

  @Column({ type: 'varchar', length: 2, nullable: true })
  vnp_TransactionStatus?: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  vnp_IpAddr?: string;

  @Column({ type: 'varchar', length: 14, nullable: true })
  vnp_CreateDate?: string;

  // --- Payout Tracking Fields ---
  @Column({
    type: 'enum',
    enum: PaymentPayoutStatus,
    default: PaymentPayoutStatus.PENDING, // Default to pending for successful payments
    nullable: true, // Null for initially pending or failed transactions
  })
  payoutStatus?: PaymentPayoutStatus;

  @Column({ type: 'timestamp with time zone', nullable: true })
  payoutDate?: Date; // Timestamp when the payout was completed or attempted

  // --- Standard Timestamps ---
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}