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

export enum RecordType {
  DIAGNOSIS = 'diagnosis',
  PRESCRIPTION = 'prescription',
  LAB_RESULT = 'lab_result',
  IMAGING = 'imaging',
  VACCINATION = 'vaccination',
  ALLERGY = 'allergy',
  PROCEDURE = 'procedure',
  NOTE = 'note',
}

@Entity('health_records')
export class HealthRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'patient_id' })
  patient: User;

  @Column({ name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'doctor_id' })
  doctor: User;

  @Column({ name: 'doctor_id', nullable: true })
  doctorId: string;

  @Column({
    type: 'enum',
    enum: RecordType,
  })
  type: RecordType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'date' })
  recordDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any>;

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[];

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ default: false })
  isConfidential: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
