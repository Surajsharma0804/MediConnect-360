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

export enum LabResultStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  ABNORMAL = 'abnormal',
  CRITICAL = 'critical',
}

@Entity('lab_results')
@Index(['userId', 'testDate'])
@Index(['testName'])
@Index(['status'])
export class LabResult {
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
  testName: string;

  @Column({ length: 255, nullable: true })
  testCode: string; // LOINC code

  @Column({ length: 100, nullable: true })
  category: string; // 'blood', 'urine', 'imaging', etc.

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date' })
  testDate: Date;

  @Column({ type: 'date', nullable: true })
  resultDate: Date;

  @Column({
    type: 'enum',
    enum: LabResultStatus,
    default: LabResultStatus.PENDING,
  })
  status: LabResultStatus;

  @Column({ type: 'jsonb' })
  results: Array<{
    name: string;
    value: string;
    unit: string;
    referenceRange: string;
    isAbnormal: boolean;
    flag?: 'high' | 'low' | 'critical';
  }>;

  @Column({ length: 255, nullable: true })
  labName: string;

  @Column({ type: 'text', nullable: true })
  labAddress: string;

  @Column({ length: 255, nullable: true })
  orderedBy: string;

  @Column({ length: 255, nullable: true })
  performedBy: string;

  @Column({ type: 'text', nullable: true })
  interpretation: string;

  @Column({ type: 'text', nullable: true })
  recommendations: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  attachments: Array<{
    name: string;
    url: string;
    type: string;
    uploadedAt: Date;
  }>;

  @Column({ type: 'boolean', default: false })
  isViewed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  viewedAt: Date;

  @Column({ type: 'boolean', default: false })
  requiresFollowUp: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
