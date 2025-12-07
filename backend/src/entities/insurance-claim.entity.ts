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
import { InsuranceCard } from './insurance-card.entity';

export enum ClaimStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  PARTIALLY_APPROVED = 'partially_approved',
  DENIED = 'denied',
  PAID = 'paid',
  APPEALED = 'appealed',
  CLOSED = 'closed',
}

export enum ClaimType {
  MEDICAL = 'medical',
  DENTAL = 'dental',
  VISION = 'vision',
  PRESCRIPTION = 'prescription',
  MENTAL_HEALTH = 'mental_health',
  PREVENTIVE = 'preventive',
  EMERGENCY = 'emergency',
  HOSPITALIZATION = 'hospitalization',
  SURGERY = 'surgery',
  LAB_TEST = 'lab_test',
  IMAGING = 'imaging',
  THERAPY = 'therapy',
}

@Entity('insurance_claims')
@Index(['userId', 'status'])
@Index(['insuranceCardId'])
@Index(['claimNumber'])
export class InsuranceClaim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  insuranceCardId: string;

  @ManyToOne(() => InsuranceCard)
  @JoinColumn({ name: 'insuranceCardId' })
  insuranceCard: InsuranceCard;

  @Column({ length: 100, unique: true })
  claimNumber: string;

  @Column({
    type: 'enum',
    enum: ClaimType,
  })
  claimType: ClaimType;

  @Column({
    type: 'enum',
    enum: ClaimStatus,
    default: ClaimStatus.DRAFT,
  })
  status: ClaimStatus;

  @Column({ type: 'date' })
  serviceDate: Date;

  @Column({ type: 'date', nullable: true })
  serviceEndDate: Date;

  @Column({ length: 255 })
  providerName: string;

  @Column({ length: 100, nullable: true })
  providerNPI: string; // National Provider Identifier

  @Column({ type: 'text', nullable: true })
  providerAddress: string;

  @Column({ type: 'text' })
  diagnosisCode: string; // ICD-10 codes

  @Column({ type: 'text', nullable: true })
  procedureCode: string; // CPT codes

  @Column({ type: 'text' })
  serviceDescription: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  billedAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  allowedAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  insurancePaid: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  patientResponsibility: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  copay: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  coinsurance: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  deductible: number;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ type: 'text', nullable: true })
  denialReason: string;

  @Column({ type: 'text', nullable: true })
  appealNotes: string;

  @Column({ type: 'jsonb', nullable: true })
  documents: string[]; // URLs to claim documents

  @Column({ type: 'text', nullable: true })
  eobUrl: string; // Explanation of Benefits URL

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
