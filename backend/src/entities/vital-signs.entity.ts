import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('vital_signs')
@Index(['userId', 'recordedAt'])
@Index(['recordedAt'])
export class VitalSigns {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  // Blood Pressure
  @Column({ type: 'int', nullable: true })
  systolicBP: number; // mmHg

  @Column({ type: 'int', nullable: true })
  diastolicBP: number; // mmHg

  // Heart Rate
  @Column({ type: 'int', nullable: true })
  heartRate: number; // bpm

  // Temperature
  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  temperature: number; // Celsius or Fahrenheit

  @Column({ length: 1, default: 'C' })
  temperatureUnit: string; // 'C' or 'F'

  // Respiratory Rate
  @Column({ type: 'int', nullable: true })
  respiratoryRate: number; // breaths per minute

  // Oxygen Saturation
  @Column({ type: 'int', nullable: true })
  oxygenSaturation: number; // SpO2 percentage

  // Weight
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number;

  @Column({ length: 10, default: 'kg' })
  weightUnit: string; // 'kg' or 'lbs'

  // Height
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height: number;

  @Column({ length: 10, default: 'cm' })
  heightUnit: string; // 'cm' or 'in'

  // BMI (calculated)
  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  bmi: number;

  // Blood Glucose
  @Column({ type: 'int', nullable: true })
  bloodGlucose: number; // mg/dL

  @Column({ length: 20, nullable: true })
  glucoseMeasurementType: string; // 'fasting', 'random', 'post_meal'

  // Pain Level
  @Column({ type: 'int', nullable: true })
  painLevel: number; // 0-10 scale

  @Column({ type: 'text', nullable: true })
  painLocation: string;

  // Additional Vitals
  @Column({ type: 'int', nullable: true })
  cholesterolTotal: number; // mg/dL

  @Column({ type: 'int', nullable: true })
  cholesterolLDL: number; // mg/dL

  @Column({ type: 'int', nullable: true })
  cholesterolHDL: number; // mg/dL

  @Column({ type: 'int', nullable: true })
  triglycerides: number; // mg/dL

  // Recording Details
  @Column({ type: 'timestamp' })
  recordedAt: Date;

  @Column({ length: 100, nullable: true })
  recordedBy: string; // 'self', 'provider', 'device'

  @Column({ length: 255, nullable: true })
  deviceName: string; // e.g., 'Apple Watch', 'Fitbit'

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
