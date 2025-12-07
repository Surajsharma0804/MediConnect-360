import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Provider } from './provider.entity';

export enum CarePlanStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED',
}

export enum CarePlanPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

@Entity('care_plans')
export class CarePlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Provider, { nullable: true })
  @JoinColumn({ name: 'created_by_provider_id' })
  createdByProvider: Provider;

  @Column({ name: 'created_by_provider_id', nullable: true })
  createdByProviderId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text', nullable: true })
  diagnosis: string;

  @Column({
    type: 'enum',
    enum: CarePlanStatus,
    default: CarePlanStatus.ACTIVE,
  })
  status: CarePlanStatus;

  @Column({
    type: 'enum',
    enum: CarePlanPriority,
    default: CarePlanPriority.MEDIUM,
  })
  priority: CarePlanPriority;

  @Column({ name: 'start_date', type: 'timestamp' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  goals: Array<{
    id: string;
    description: string;
    targetDate?: string;
    completed: boolean;
    progress?: number;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  tasks: Array<{
    id: string;
    description: string;
    frequency?: string;
    dueDate?: string;
    completed: boolean;
    assignedTo?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  appointments: Array<{
    type: string;
    provider: string;
    frequency: string;
    nextDate?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  restrictions: Array<{
    type: string;
    description: string;
  }>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'progress_percentage', default: 0 })
  progressPercentage: number;

  @Column({ name: 'last_reviewed_date', type: 'timestamp', nullable: true })
  lastReviewedDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
