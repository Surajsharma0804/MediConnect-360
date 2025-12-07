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

export enum InsuranceType {
  HEALTH = 'health',
  DENTAL = 'dental',
  VISION = 'vision',
  PRESCRIPTION = 'prescription',
  MEDICARE = 'medicare',
  MEDICAID = 'medicaid',
}

export enum InsuranceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING_VERIFICATION = 'pending_verification',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('insurance_cards')
@Index(['userId', 'status'])
@Index(['insuranceProvider'])
export class InsuranceCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: InsuranceType,
    default: InsuranceType.HEALTH,
  })
  type: InsuranceType;

  @Column({ length: 255 })
  insuranceProvider: string;

  @Column({ length: 100 })
  planName: string;

  @Column({ length: 100, unique: true })
  memberId: string;

  @Column({ length: 100, nullable: true })
  groupNumber: string;

  @Column({ length: 100, nullable: true })
  policyNumber: string;

  @Column({ length: 100, nullable: true })
  rxBin: string; // Prescription BIN

  @Column({ length: 100, nullable: true })
  rxPcn: string; // Prescription PCN

  @Column({ length: 100, nullable: true })
  rxGroup: string; // Prescription Group

  @Column({ type: 'date', nullable: true })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  expirationDate: Date;

  @Column({
    type: 'enum',
    enum: InsuranceStatus,
    default: InsuranceStatus.PENDING_VERIFICATION,
  })
  status: InsuranceStatus;

  @Column({ type: 'boolean', default: false })
  isPrimary: boolean;

  @Column({ type: 'text', nullable: true })
  policyHolderName: string;

  @Column({ type: 'date', nullable: true })
  policyHolderDob: Date;

  @Column({ length: 50, nullable: true })
  relationshipToPolicyHolder: string; // Self, Spouse, Child, etc.

  @Column({ type: 'text', nullable: true })
  insuranceAddress: string;

  @Column({ length: 20, nullable: true })
  insurancePhone: string;

  @Column({ length: 20, nullable: true })
  claimsPhone: string;

  @Column({ length: 255, nullable: true })
  insuranceWebsite: string;

  @Column({ type: 'text', nullable: true })
  frontImageUrl: string; // Front of insurance card

  @Column({ type: 'text', nullable: true })
  backImageUrl: string; // Back of insurance card

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  copayPrimaryCare: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  copaySpecialist: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  copayEmergency: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  copayUrgentCare: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  deductible: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  deductibleMet: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  outOfPocketMax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  outOfPocketMet: number;

  @Column({ type: 'timestamp', nullable: true })
  lastVerifiedAt: Date;

  @Column({ type: 'text', nullable: true })
  verificationNotes: string;

  @Column({ type: 'jsonb', nullable: true })
  coverageDetails: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
