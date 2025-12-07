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

export enum TrackingType {
  FITNESS = 'fitness',
  SLEEP = 'sleep',
  MOOD = 'mood',
  PAIN = 'pain',
  SYMPTOM = 'symptom',
  MEDICATION_ADHERENCE = 'medication_adherence',
  WEIGHT = 'weight',
  NUTRITION = 'nutrition',
  WATER = 'water',
  MENSTRUAL = 'menstrual',
  BLOOD_PRESSURE = 'blood_pressure',
  BLOOD_GLUCOSE = 'blood_glucose',
  HEART_RATE = 'heart_rate',
}

export enum MoodLevel {
  VERY_BAD = 1,
  BAD = 2,
  NEUTRAL = 3,
  GOOD = 4,
  VERY_GOOD = 5,
}

export enum PainLevel {
  NONE = 0,
  MILD = 1,
  MODERATE = 2,
  SEVERE = 3,
  VERY_SEVERE = 4,
  WORST_POSSIBLE = 5,
}

export enum SleepQuality {
  VERY_POOR = 1,
  POOR = 2,
  FAIR = 3,
  GOOD = 4,
  EXCELLENT = 5,
}

@Entity('health_tracking')
@Index(['userId', 'trackingType', 'trackedAt'])
@Index(['userId', 'trackedAt'])
export class HealthTracking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: TrackingType,
  })
  trackingType: TrackingType;

  @Column({ type: 'timestamp' })
  trackedAt: Date;

  // Fitness Tracking
  @Column({ type: 'int', nullable: true })
  steps: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  distance: number; // in km

  @Column({ type: 'int', nullable: true })
  caloriesBurned: number;

  @Column({ type: 'int', nullable: true })
  activeMinutes: number;

  @Column({ type: 'int', nullable: true })
  exerciseMinutes: number;

  @Column({ length: 100, nullable: true })
  exerciseType: string;

  // Sleep Tracking
  @Column({ type: 'timestamp', nullable: true })
  sleepStart: Date;

  @Column({ type: 'timestamp', nullable: true })
  sleepEnd: Date;

  @Column({ type: 'int', nullable: true })
  sleepDurationMinutes: number;

  @Column({ type: 'int', nullable: true })
  deepSleepMinutes: number;

  @Column({ type: 'int', nullable: true })
  lightSleepMinutes: number;

  @Column({ type: 'int', nullable: true })
  remSleepMinutes: number;

  @Column({ type: 'int', nullable: true })
  awakeMinutes: number;

  @Column({
    type: 'enum',
    enum: SleepQuality,
    nullable: true,
  })
  sleepQuality: SleepQuality;

  // Mood Tracking
  @Column({
    type: 'enum',
    enum: MoodLevel,
    nullable: true,
  })
  moodLevel: MoodLevel;

  @Column({ type: 'jsonb', nullable: true })
  moodFactors: string[]; // stress, anxiety, happiness, etc.

  @Column({ type: 'text', nullable: true })
  moodNotes: string;

  // Pain Tracking
  @Column({
    type: 'enum',
    enum: PainLevel,
    nullable: true,
  })
  painLevel: PainLevel;

  @Column({ length: 100, nullable: true })
  painLocation: string;

  @Column({ length: 100, nullable: true })
  painType: string; // sharp, dull, throbbing, etc.

  @Column({ type: 'jsonb', nullable: true })
  painTriggers: string[];

  @Column({ type: 'text', nullable: true })
  painNotes: string;

  // Symptom Tracking
  @Column({ length: 200, nullable: true })
  symptomName: string;

  @Column({ type: 'int', nullable: true })
  symptomSeverity: number; // 1-10

  @Column({ type: 'jsonb', nullable: true })
  symptomDetails: Record<string, any>;

  // Medication Adherence
  @Column({ length: 200, nullable: true })
  medicationName: string;

  @Column({ type: 'boolean', nullable: true })
  medicationTaken: boolean;

  @Column({ type: 'timestamp', nullable: true })
  medicationScheduledTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  medicationActualTime: Date;

  @Column({ type: 'text', nullable: true })
  medicationSkipReason: string;

  // Weight Tracking
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number;

  @Column({ length: 10, nullable: true })
  weightUnit: string; // kg or lbs

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  bodyFatPercentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  muscleMass: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  bmi: number;

  // Nutrition Tracking
  @Column({ type: 'int', nullable: true })
  caloriesConsumed: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  proteinGrams: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  carbsGrams: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  fatGrams: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  fiberGrams: number;

  @Column({ type: 'jsonb', nullable: true })
  meals: Array<{
    name: string;
    time: string;
    calories: number;
    description: string;
  }>;

  // Water Intake
  @Column({ type: 'int', nullable: true })
  waterIntakeMl: number;

  @Column({ type: 'int', nullable: true })
  waterGoalMl: number;

  // Menstrual Cycle
  @Column({ type: 'boolean', nullable: true })
  isPeriodDay: boolean;

  @Column({ length: 50, nullable: true })
  flowLevel: string; // light, medium, heavy

  @Column({ type: 'jsonb', nullable: true })
  menstrualSymptoms: string[]; // cramps, bloating, mood swings, etc.

  @Column({ type: 'boolean', nullable: true })
  isOvulationDay: boolean;

  // Blood Pressure
  @Column({ type: 'int', nullable: true })
  systolicBP: number;

  @Column({ type: 'int', nullable: true })
  diastolicBP: number;

  @Column({ type: 'int', nullable: true })
  pulseBPM: number;

  // Blood Glucose
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  bloodGlucose: number; // mg/dL

  @Column({ length: 50, nullable: true })
  glucoseMeasurementType: string; // fasting, post-meal, random

  // Heart Rate
  @Column({ type: 'int', nullable: true })
  heartRate: number; // BPM

  @Column({ type: 'int', nullable: true })
  restingHeartRate: number;

  @Column({ type: 'int', nullable: true })
  maxHeartRate: number;

  // General
  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  wearableData: Record<string, any>; // Data from wearable devices

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
