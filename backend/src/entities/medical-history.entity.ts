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

export enum ConditionSeverity {
  MILD = 'mild',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  CRITICAL = 'critical',
}

export enum ConditionStatus {
  ACTIVE = 'active',
  RESOLVED = 'resolved',
  CHRONIC = 'chronic',
  MANAGED = 'managed',
}

@Entity('medical_histories')
@Index(['userId', 'status'])
@Index(['conditionName'])
export class MedicalHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ length: 255 })
  conditionName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ConditionSeverity,
    default: ConditionSeverity.MILD,
  })
  severity: ConditionSeverity;

  @Column({
    type: 'enum',
    enum: ConditionStatus,
    default: ConditionStatus.ACTIVE,
  })
  status: ConditionStatus;

  @Column({ type: 'date' })
  diagnosisDate: Date;

  @Column({ type: 'date', nullable: true })
  resolvedDate: Date;

  @Column({ length: 255, nullable: true })
  diagnosedBy: string;

  @Column({ type: 'text', nullable: true })
  treatment: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  symptoms: string[];

  @Column({ type: 'jsonb', nullable: true })
  medications: string[];

  @Column({ type: 'boolean', default: false })
  isFamilyHistory: boolean;

  @Column({ length: 100, nullable: true })
  familyRelation: string;

  @Column({ type: 'jsonb', nullable: true })
  attachments: Array<{
    name: string;
    url: string;
    type: string;
    uploadedAt: Date;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
