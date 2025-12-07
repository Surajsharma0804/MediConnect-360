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

export enum PrescriptionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export enum PrescriptionFrequency {
  ONCE_DAILY = 'once_daily',
  TWICE_DAILY = 'twice_daily',
  THREE_TIMES_DAILY = 'three_times_daily',
  FOUR_TIMES_DAILY = 'four_times_daily',
  AS_NEEDED = 'as_needed',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

@Entity('prescriptions')
@Index(['userId', 'status'])
@Index(['medicationName'])
export class Prescription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  providerId: string;

  @Column({ type: 'uuid', nullable: true })
  appointmentId: string;

  @Column({ length: 255 })
  medicationName: string;

  @Column({ length: 255, nullable: true })
  genericName: string;

  @Column({ length: 100 })
  dosage: string;

  @Column({
    type: 'enum',
    enum: PrescriptionFrequency,
  })
  frequency: PrescriptionFrequency;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int', default: 0 })
  refillsRemaining: number;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @Column({ type: 'text', nullable: true })
  sideEffects: string;

  @Column({ type: 'text', nullable: true })
  warnings: string;

  @Column({
    type: 'enum',
    enum: PrescriptionStatus,
    default: PrescriptionStatus.ACTIVE,
  })
  status: PrescriptionStatus;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'date', nullable: true })
  lastRefillDate: Date;

  @Column({ type: 'date', nullable: true })
  nextRefillDate: Date;

  @Column({ length: 255, nullable: true })
  pharmacyName: string;

  @Column({ length: 255, nullable: true })
  pharmacyPhone: string;

  @Column({ type: 'text', nullable: true })
  pharmacyAddress: string;

  @Column({ type: 'boolean', default: false })
  isControlledSubstance: boolean;

  @Column({ type: 'boolean', default: true })
  reminderEnabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  reminderTimes: string[]; // Array of times like ["08:00", "20:00"]

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
