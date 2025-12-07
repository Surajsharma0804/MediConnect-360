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

export enum AccountType {
  HSA = 'hsa', // Health Savings Account
  FSA = 'fsa', // Flexible Spending Account
  HRA = 'hra', // Health Reimbursement Arrangement
  LPFSA = 'lpfsa', // Limited Purpose FSA
  DCFSA = 'dcfsa', // Dependent Care FSA
}

export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  CLOSED = 'closed',
}

@Entity('hsa_fsa_accounts')
@Index(['userId', 'status'])
export class HsaFsaAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: AccountType,
  })
  accountType: AccountType;

  @Column({ length: 100, unique: true })
  accountNumber: string;

  @Column({ length: 255 })
  provider: string;

  @Column({
    type: 'enum',
    enum: AccountStatus,
    default: AccountStatus.ACTIVE,
  })
  status: AccountStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  currentBalance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  annualContributionLimit: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  contributedThisYear: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  employerContribution: number;

  @Column({ type: 'int' })
  planYear: number;

  @Column({ type: 'date' })
  planYearStartDate: Date;

  @Column({ type: 'date' })
  planYearEndDate: Date;

  @Column({ type: 'boolean', default: false })
  hasDebitCard: boolean;

  @Column({ length: 20, nullable: true })
  debitCardLast4: string;

  @Column({ type: 'text', nullable: true })
  routingNumber: string;

  @Column({ type: 'text', nullable: true })
  accountNumberLast4: string;

  @Column({ type: 'boolean', default: true })
  autoReimbursement: boolean;

  @Column({ type: 'jsonb', nullable: true })
  eligibleExpenses: string[];

  @Column({ type: 'jsonb', nullable: true })
  transactions: Array<{
    date: Date;
    description: string;
    amount: number;
    type: 'contribution' | 'withdrawal' | 'reimbursement';
    status: string;
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
