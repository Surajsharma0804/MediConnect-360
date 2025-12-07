import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

export enum PaymentPlanStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DEFAULTED = 'defaulted',
  CANCELLED = 'cancelled',
}

export enum PaymentFrequency {
  WEEKLY = 'weekly',
  BI_WEEKLY = 'bi_weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
}

@Entity('payment_plans')
@Index(['userId', 'status'])
export class PaymentPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ length: 255 })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amountPaid: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amountRemaining: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  installmentAmount: number;

  @Column({
    type: 'enum',
    enum: PaymentFrequency,
    default: PaymentFrequency.MONTHLY,
  })
  frequency: PaymentFrequency;

  @Column({ type: 'int' })
  totalInstallments: number;

  @Column({ type: 'int', default: 0 })
  installmentsPaid: number;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  nextPaymentDate: Date;

  @Column({ type: 'date', nullable: true })
  completedDate: Date;

  @Column({
    type: 'enum',
    enum: PaymentPlanStatus,
    default: PaymentPlanStatus.ACTIVE,
  })
  status: PaymentPlanStatus;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  interestRate: number;

  @Column({ type: 'boolean', default: true })
  autoPayEnabled: boolean;

  @Column({ type: 'text', nullable: true })
  paymentMethodId: string; // Stripe payment method ID

  @Column({ type: 'jsonb', nullable: true })
  paymentHistory: Array<{
    date: Date;
    amount: number;
    status: string;
    transactionId: string;
  }>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
