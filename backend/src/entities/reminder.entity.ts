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

export enum ReminderType {
  MEDICATION = 'MEDICATION',
  APPOINTMENT = 'APPOINTMENT',
  LAB_TEST = 'LAB_TEST',
  VACCINATION = 'VACCINATION',
  HEALTH_CHECKUP = 'HEALTH_CHECKUP',
  PRESCRIPTION_REFILL = 'PRESCRIPTION_REFILL',
  EXERCISE = 'EXERCISE',
  WATER_INTAKE = 'WATER_INTAKE',
  MEAL = 'MEAL',
  BLOOD_PRESSURE = 'BLOOD_PRESSURE',
  BLOOD_GLUCOSE = 'BLOOD_GLUCOSE',
  WEIGHT = 'WEIGHT',
  CUSTOM = 'CUSTOM',
}

export enum ReminderFrequency {
  ONCE = 'ONCE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  CUSTOM = 'CUSTOM',
}

export enum ReminderStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  SNOOZED = 'SNOOZED',
  CANCELLED = 'CANCELLED',
}

@Entity('reminders')
export class Reminder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ReminderType,
  })
  reminderType: ReminderType;

  @Column({
    type: 'enum',
    enum: ReminderFrequency,
  })
  frequency: ReminderFrequency;

  @Column({
    type: 'enum',
    enum: ReminderStatus,
    default: ReminderStatus.ACTIVE,
  })
  status: ReminderStatus;

  @Column({ name: 'reminder_time', type: 'timestamp' })
  reminderTime: Date;

  @Column({ name: 'next_reminder_time', type: 'timestamp', nullable: true })
  nextReminderTime: Date;

  @Column({ name: 'end_date', type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ type: 'simple-array', nullable: true })
  daysOfWeek: string[]; // ['Monday', 'Wednesday', 'Friday']

  @Column({ name: 'custom_schedule', type: 'jsonb', nullable: true })
  customSchedule: {
    times?: string[]; // ['08:00', '14:00', '20:00']
    interval?: number; // in minutes
  };

  @Column({ name: 'snooze_until', type: 'timestamp', nullable: true })
  snoozeUntil: Date;

  @Column({ name: 'notification_methods', type: 'simple-array' })
  notificationMethods: string[]; // ['push', 'email', 'sms']

  @Column({ name: 'advance_notice_minutes', default: 0 })
  advanceNoticeMinutes: number;

  @Column({ name: 'is_recurring', default: false })
  isRecurring: boolean;

  @Column({ name: 'completion_count', default: 0 })
  completionCount: number;

  @Column({ name: 'last_completed_at', type: 'timestamp', nullable: true })
  lastCompletedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  relatedData: {
    medicationId?: string;
    appointmentId?: string;
    prescriptionId?: string;
    labTestId?: string;
  };

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
