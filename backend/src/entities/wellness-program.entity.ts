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

export enum ProgramType {
  WEIGHT_LOSS = 'WEIGHT_LOSS',
  FITNESS = 'FITNESS',
  NUTRITION = 'NUTRITION',
  MENTAL_HEALTH = 'MENTAL_HEALTH',
  SMOKING_CESSATION = 'SMOKING_CESSATION',
  DIABETES_MANAGEMENT = 'DIABETES_MANAGEMENT',
  HYPERTENSION_MANAGEMENT = 'HYPERTENSION_MANAGEMENT',
  STRESS_MANAGEMENT = 'STRESS_MANAGEMENT',
  SLEEP_IMPROVEMENT = 'SLEEP_IMPROVEMENT',
  CUSTOM = 'CUSTOM',
}

export enum ProgramStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED',
  ABANDONED = 'ABANDONED',
}

@Entity('wellness_programs')
export class WellnessProgram {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: ProgramType,
  })
  programType: ProgramType;

  @Column({
    type: 'enum',
    enum: ProgramStatus,
    default: ProgramStatus.NOT_STARTED,
  })
  status: ProgramStatus;

  @Column({ name: 'start_date', type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ name: 'duration_days', nullable: true })
  durationDays: number;

  @Column({ type: 'jsonb', nullable: true })
  goals: Array<{
    id: string;
    description: string;
    targetValue?: number;
    currentValue?: number;
    unit?: string;
    completed: boolean;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    targetDate?: string;
    achieved: boolean;
    achievedDate?: string;
    reward?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  dailyTasks: Array<{
    id: string;
    description: string;
    completed: boolean;
    streak?: number;
  }>;

  @Column({ name: 'progress_percentage', default: 0 })
  progressPercentage: number;

  @Column({ name: 'points_earned', default: 0 })
  pointsEarned: number;

  @Column({ name: 'current_streak', default: 0 })
  currentStreak: number;

  @Column({ name: 'longest_streak', default: 0 })
  longestStreak: number;

  @Column({ type: 'jsonb', nullable: true })
  badges: Array<{
    id: string;
    name: string;
    description: string;
    earnedDate: string;
    icon?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  weeklyProgress: Array<{
    week: number;
    startDate: string;
    endDate: string;
    tasksCompleted: number;
    totalTasks: number;
    points: number;
  }>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
