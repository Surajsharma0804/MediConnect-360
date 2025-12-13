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

  @Column()
  userId: string;

  @Column()
  insuranceCardId: string;

  @Column()
  providerId: string;

  @Column()
  serviceType: string;

  @Column()
  serviceDate: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ nullable: true })
  diagnosis: string;

  @Column('simple-array', { nullable: true })
  procedureCodes: string[];

  @Column({ nullable: true })
  notes: string;

  @Column({
    type: 'enum',
    enum: ClaimStatus,
    default: ClaimStatus.DRAFT,
  })
  status: ClaimStatus;

  @Column({ nullable: true })
  submittedAt: Date;

  @Column({ nullable: true })
  processedAt: Date;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  approvedAmount: number;

  @Column({ nullable: true })
  denialReason: string;

  @Column({ nullable: true })
  appealReason: string;

  @Column({ nullable: true })
  appealedAt: Date;

  @Column('json', { nullable: true })
  documents: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}