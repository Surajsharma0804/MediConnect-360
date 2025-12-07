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
import { Prescription } from './prescription.entity';
import { Pharmacy } from './pharmacy.entity';

export enum EPrescriptionStatus {
  PENDING = 'pending',
  SENT = 'sent',
  RECEIVED = 'received',
  FILLED = 'filled',
  READY_FOR_PICKUP = 'ready_for_pickup',
  PICKED_UP = 'picked_up',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

export enum DeliveryMethod {
  PICKUP = 'pickup',
  HOME_DELIVERY = 'home_delivery',
  MAIL_ORDER = 'mail_order',
}

@Entity('e_prescriptions')
@Index(['userId', 'status'])
@Index(['pharmacyId', 'status'])
@Index(['prescriptionId'])
export class EPrescription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'uuid' })
  prescriptionId: string;

  @ManyToOne(() => Prescription)
  @JoinColumn({ name: 'prescriptionId' })
  prescription: Prescription;

  @Column({ type: 'uuid' })
  pharmacyId: string;

  @ManyToOne(() => Pharmacy)
  @JoinColumn({ name: 'pharmacyId' })
  pharmacy: Pharmacy;

  @Column({ type: 'uuid', nullable: true })
  providerId: string;

  @Column({
    type: 'enum',
    enum: EPrescriptionStatus,
    default: EPrescriptionStatus.PENDING,
  })
  status: EPrescriptionStatus;

  @Column({
    type: 'enum',
    enum: DeliveryMethod,
    default: DeliveryMethod.PICKUP,
  })
  deliveryMethod: DeliveryMethod;

  @Column({ type: 'text', nullable: true })
  deliveryAddress: string;

  @Column({ type: 'text', nullable: true })
  deliveryInstructions: string;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  receivedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  filledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  readyAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  finalCost: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  insuranceCoverage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  copay: number;

  @Column({ type: 'text', nullable: true })
  trackingNumber: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
