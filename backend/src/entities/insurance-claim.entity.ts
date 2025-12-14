import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ClaimStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  PROCESSING = 'processing',
  APPROVED = 'approved',
  DENIED = 'denied',
  APPEALED = 'appealed',
  PAID = 'paid',
}

@Entity('insurance_claims')
export class InsuranceClaim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  insuranceCardId: string;

  @Column({ type: 'uuid' })
  providerId: string;

  @Column({ type: 'varchar', length: 255 })
  serviceType: string;

  @Column({ type: 'date' })
  serviceDate: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'text', nullable: true })
  diagnosis: string;

  @Column({ type: 'simple-array', nullable: true })
  procedureCodes: string[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({
    type: 'enum',
    enum: ClaimStatus,
    default: ClaimStatus.DRAFT,
  })
  status: ClaimStatus;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  approvedAmount: number;

  @Column({ type: 'text', nullable: true })
  denialReason: string;

  @Column({ type: 'text', nullable: true })
  appealReason: string;

  @Column({ type: 'timestamp', nullable: true })
  appealedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  documents: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    uploadedAt: string;
  }>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}