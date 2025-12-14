import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show',
}

export enum AppointmentType {
  VIDEO = 'video',
  IN_PERSON = 'in_person',
  PHONE = 'phone',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @Column({ name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'doctor_id' })
  doctor: User;

  @Column({ name: 'doctor_id' })
  doctorId: string;

  @Column({ type: 'timestamp' })
  scheduledAt: Date;

  @Column({ type: 'int', default: 30 })
  durationMinutes: number;

  @Column({
    type: 'enum',
    enum: AppointmentType,
    default: AppointmentType.VIDEO,
  })
  type: AppointmentType;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING,
  })
  status: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  videoRoomUrl: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;
}
