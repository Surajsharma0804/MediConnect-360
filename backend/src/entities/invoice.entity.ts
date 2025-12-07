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

export enum InvoiceStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  VIEWED = 'viewed',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum InvoiceType {
  CONSULTATION = 'consultation',
  PRESCRIPTION = 'prescription',
  LAB_TEST = 'lab_test',
  IMAGING = 'imaging',
  PROCEDURE = 'procedure',
  SUBSCRIPTION = 'subscription',
  OTHER = 'other',
}

@Entity('invoices')
@Index(['userId', 'status'])
@Index(['invoiceNumber'])
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ length: 100, unique: true })
  invoiceNumber: string;

  @Column({
    type: 'enum',
    enum: InvoiceType,
  })
  type: InvoiceType;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT,
  })
  status: InvoiceStatus;

  @Column({ type: 'date' })
  issueDate: Date;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'date', nullable: true })
  paidDate: Date;

  @Column({ type: 'jsonb' })
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    cptCode?: string;
    icdCode?: string;
  }>;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountPaid: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amountDue: number;

  @Column({ length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'uuid', nullable: true })
  appointmentId: string;

  @Column({ type: 'uuid', nullable: true })
  insuranceCardId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  insuranceCoverage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  patientResponsibility: number;

  @Column({ type: 'text', nullable: true })
  paymentIntentId: string; // Stripe payment intent ID

  @Column({ type: 'text', nullable: true })
  receiptUrl: string;

  @Column({ type: 'text', nullable: true })
  pdfUrl: string;

  @Column({ type: 'text', nullable: true })
  superbillUrl: string; // For insurance reimbursement

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  paymentTerms: string;

  @Column({ type: 'jsonb', nullable: true })
  paymentHistory: Array<{
    date: Date;
    amount: number;
    method: string;
    transactionId: string;
  }>;

  @Column({ type: 'boolean', default: false })
  isSuperbill: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
