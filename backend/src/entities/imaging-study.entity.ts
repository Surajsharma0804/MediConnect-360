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

export enum ImagingModality {
  X_RAY = 'X_RAY',
  CT_SCAN = 'CT_SCAN',
  MRI = 'MRI',
  ULTRASOUND = 'ULTRASOUND',
  PET_SCAN = 'PET_SCAN',
  MAMMOGRAM = 'MAMMOGRAM',
  DEXA_SCAN = 'DEXA_SCAN',
  FLUOROSCOPY = 'FLUOROSCOPY',
  NUCLEAR_MEDICINE = 'NUCLEAR_MEDICINE',
  ANGIOGRAPHY = 'ANGIOGRAPHY',
}

export enum ImagingStatus {
  ORDERED = 'ORDERED',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  RESULTS_READY = 'RESULTS_READY',
  CANCELLED = 'CANCELLED',
}

@Entity('imaging_studies')
export class ImagingStudy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Provider, { nullable: true })
  @JoinColumn({ name: 'ordered_by_provider_id' })
  orderedByProvider: Provider;

  @Column({ name: 'ordered_by_provider_id', nullable: true })
  orderedByProviderId: string;

  @Column({
    type: 'enum',
    enum: ImagingModality,
  })
  modality: ImagingModality;

  @Column()
  studyDescription: string;

  @Column({ nullable: true })
  bodyPart: string;

  @Column({ type: 'text', nullable: true })
  clinicalIndication: string;

  @Column({
    type: 'enum',
    enum: ImagingStatus,
    default: ImagingStatus.ORDERED,
  })
  status: ImagingStatus;

  @Column({ name: 'imaging_center_name', nullable: true })
  imagingCenterName: string;

  @Column({ name: 'imaging_center_address', nullable: true })
  imagingCenterAddress: string;

  @Column({ type: 'timestamp', nullable: true })
  scheduledDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  performedDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  reportedDate: Date;

  @Column({ type: 'text', nullable: true })
  findings: string;

  @Column({ type: 'text', nullable: true })
  impression: string;

  @Column({ type: 'text', nullable: true })
  recommendations: string;

  @Column({ name: 'radiologist_name', nullable: true })
  radiologistName: string;

  @Column({ type: 'jsonb', nullable: true })
  imageUrls: string[];

  @Column({ type: 'jsonb', nullable: true })
  dicomUrls: string[];

  @Column({ name: 'report_url', nullable: true })
  reportUrl: string;

  @Column({ name: 'ai_analysis', type: 'jsonb', nullable: true })
  aiAnalysis: {
    findings?: string[];
    confidence?: number;
    abnormalitiesDetected?: boolean;
    suggestedFollowUp?: string;
  };

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @Column({ name: 'cancellation_reason', nullable: true })
  cancellationReason: string;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @Column({ name: 'share_token', nullable: true })
  shareToken: string;

  @Column({ name: 'share_expires_at', nullable: true })
  shareExpiresAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  results: any;

  @Column({ name: 'radiologist_report', type: 'text', nullable: true })
  radiologistReport: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
