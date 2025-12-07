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
import { Appointment } from './appointment.entity';

@Entity('visit_summaries')
export class VisitSummary {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Provider)
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @Column({ name: 'provider_id' })
  providerId: string;

  @ManyToOne(() => Appointment, { nullable: true })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @Column({ name: 'appointment_id', nullable: true })
  appointmentId: string;

  @Column({ name: 'visit_date', type: 'timestamp' })
  visitDate: Date;

  @Column({ name: 'visit_type' })
  visitType: string; // 'Video', 'In-Person', 'Phone'

  @Column({ name: 'chief_complaint', type: 'text', nullable: true })
  chiefComplaint: string;

  @Column({ type: 'text', nullable: true })
  diagnosis: string;

  @Column({ type: 'jsonb', nullable: true })
  vitalSigns: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    oxygenSaturation?: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  symptoms: string[];

  @Column({ type: 'text', nullable: true })
  assessment: string;

  @Column({ type: 'text', nullable: true })
  treatmentPlan: string;

  @Column({ type: 'jsonb', nullable: true })
  prescriptions: Array<{
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  labTestsOrdered: Array<{
    testName: string;
    reason: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  imagingOrdered: Array<{
    type: string;
    bodyPart: string;
    reason: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  referrals: Array<{
    specialty: string;
    provider?: string;
    reason: string;
  }>;

  @Column({ type: 'text', nullable: true })
  followUpInstructions: string;

  @Column({ name: 'follow_up_date', type: 'timestamp', nullable: true })
  followUpDate: Date;

  @Column({ type: 'text', nullable: true })
  providerNotes: string;

  @Column({ type: 'text', nullable: true })
  patientEducation: string;

  @Column({ name: 'visit_duration_minutes', nullable: true })
  visitDurationMinutes: number;

  @Column({ name: 'recording_url', nullable: true })
  recordingUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  attachments: Array<{
    fileName: string;
    fileUrl: string;
    fileType: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
