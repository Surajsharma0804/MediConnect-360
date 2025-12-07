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

export enum ImmunizationStatus {
  COMPLETED = 'completed',
  SCHEDULED = 'scheduled',
  OVERDUE = 'overdue',
  DECLINED = 'declined',
}

@Entity('immunizations')
@Index(['userId', 'administeredDate'])
@Index(['vaccineName'])
export class Immunization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ length: 255 })
  vaccineName: string;

  @Column({ length: 100, nullable: true })
  vaccineCode: string; // CVX code

  @Column({ length: 255, nullable: true })
  manufacturer: string;

  @Column({ length: 100, nullable: true })
  lotNumber: string;

  @Column({ type: 'date' })
  administeredDate: Date;

  @Column({ type: 'date', nullable: true })
  expirationDate: Date;

  @Column({ type: 'date', nullable: true })
  nextDoseDate: Date;

  @Column({ type: 'int', default: 1 })
  doseNumber: number;

  @Column({ type: 'int', nullable: true })
  totalDosesRequired: number;

  @Column({
    type: 'enum',
    enum: ImmunizationStatus,
    default: ImmunizationStatus.COMPLETED,
  })
  status: ImmunizationStatus;

  @Column({ length: 255, nullable: true })
  administeredBy: string;

  @Column({ length: 255, nullable: true })
  facilityName: string;

  @Column({ type: 'text', nullable: true })
  facilityAddress: string;

  @Column({ length: 100, nullable: true })
  route: string; // e.g., 'intramuscular', 'oral', 'subcutaneous'

  @Column({ length: 100, nullable: true })
  site: string; // e.g., 'left arm', 'right thigh'

  @Column({ type: 'text', nullable: true })
  reactions: string;

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
  isBooster: boolean;

  @Column({ type: 'boolean', default: true })
  reminderEnabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
