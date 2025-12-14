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

export enum LabTestType {
  BLOOD_WORK = 'BLOOD_WORK',
  URINE_TEST = 'URINE_TEST',
  IMAGING = 'IMAGING',
  GENETIC_TEST = 'GENETIC_TEST',
  ALLERGY_TEST = 'ALLERGY_TEST',
  STD_PANEL = 'STD_PANEL',
  HORMONE_PANEL = 'HORMONE_PANEL',
  METABOLIC_PANEL = 'METABOLIC_PANEL',
  LIPID_PANEL = 'LIPID_PANEL',
  THYROID_PANEL = 'THYROID_PANEL',
  VITAMIN_PANEL = 'VITAMIN_PANEL',
  COVID_TEST = 'COVID_TEST',
  FLU_TEST = 'FLU_TEST',
  PREGNANCY_TEST = 'PREGNANCY_TEST',
  DRUG_SCREENING = 'DRUG_SCREENING',
  BIOPSY = 'BIOPSY',
  CULTURE = 'CULTURE',
  OTHER = 'OTHER',
}

export enum LabTestStatus {
  ORDERED = 'ORDERED',
  SCHEDULED = 'SCHEDULED',
  SAMPLE_COLLECTED = 'SAMPLE_COLLECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  RESULTS_READY = 'RESULTS_READY',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED',
}

export enum LabTestPriority {
  ROUTINE = 'ROUTINE',
  URGENT = 'URGENT',
  STAT = 'STAT',
}

@Entity('lab_test_orders')
export class LabTestOrder {
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
    enum: LabTestType,
  })
  testType: LabTestType;

  @Column({ type: 'varchar', length: 255 })
  testName: string;

  @Column({ type: 'text', nullable: true })
  testDescription: string;

  @Column({ type: 'jsonb', nullable: true })
  testCodes: {
    loinc?: string;
    cpt?: string;
    icd10?: string[];
  };

  @Column({
    type: 'enum',
    enum: LabTestStatus,
    default: LabTestStatus.ORDERED,
  })
  status: LabTestStatus;

  @Column({
    type: 'enum',
    enum: LabTestPriority,
    default: LabTestPriority.ROUTINE,
  })
  priority: LabTestPriority;

  @Column({ name: 'is_home_kit', default: false })
  isHomeKit: boolean;

  @Column({ name: 'lab_facility_name', nullable: true })
  labFacilityName: string;

  @Column({ name: 'lab_facility_address', nullable: true })
  labFacilityAddress: string;

  @Column({ type: 'timestamp', nullable: true })
  scheduledDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  collectionDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedDate: Date;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @Column({ type: 'text', nullable: true })
  preparationNotes: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedCost: number;

  @Column({ nullable: true })
  currency: string;

  @Column({ name: 'insurance_covered', default: false })
  insuranceCovered: boolean;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
