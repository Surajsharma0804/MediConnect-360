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
import { LabTestOrder } from './lab-test-order.entity';

export enum ResultStatus {
  NORMAL = 'NORMAL',
  ABNORMAL = 'ABNORMAL',
  CRITICAL = 'CRITICAL',
  PENDING = 'PENDING',
}

@Entity('lab_test_result_details')
export class LabTestResultDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => LabTestOrder, { nullable: true })
  @JoinColumn({ name: 'lab_test_order_id' })
  labTestOrder: LabTestOrder;

  @Column({ name: 'lab_test_order_id', nullable: true })
  labTestOrderId: string;

  @Column({ type: 'varchar', length: 255 })
  testName: string;

  @Column({ type: 'varchar', length: 255 })
  componentName: string;

  @Column({ type: 'text', nullable: true })
  value: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unit: string;

  @Column({ name: 'reference_range', nullable: true })
  referenceRange: string;

  @Column({
    type: 'enum',
    enum: ResultStatus,
    default: ResultStatus.PENDING,
  })
  status: ResultStatus;

  @Column({ name: 'is_abnormal', default: false })
  isAbnormal: boolean;

  @Column({ name: 'is_critical', default: false })
  isCritical: boolean;

  @Column({ type: 'text', nullable: true })
  interpretation: string;

  @Column({ name: 'ai_interpretation', type: 'text', nullable: true })
  aiInterpretation: string;

  @Column({ name: 'loinc_code', nullable: true })
  loincCode: string;

  @Column({ type: 'timestamp', nullable: true })
  resultDate: Date;

  @Column({ name: 'lab_name', nullable: true })
  labName: string;

  @Column({ type: 'jsonb', nullable: true })
  historicalValues: Array<{
    date: string;
    value: string;
    status: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  trendAnalysis: {
    trend?: 'IMPROVING' | 'WORSENING' | 'STABLE';
    percentageChange?: number;
    recommendation?: string;
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
