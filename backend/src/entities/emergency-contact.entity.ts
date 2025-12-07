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

export enum ContactRelationship {
  SPOUSE = 'spouse',
  PARENT = 'parent',
  CHILD = 'child',
  SIBLING = 'sibling',
  FRIEND = 'friend',
  NEIGHBOR = 'neighbor',
  CAREGIVER = 'caregiver',
  OTHER = 'other',
}

@Entity('emergency_contacts')
@Index(['userId', 'priority'])
export class EmergencyContact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ length: 255 })
  firstName: string;

  @Column({ length: 255 })
  lastName: string;

  @Column({
    type: 'enum',
    enum: ContactRelationship,
  })
  relationship: ContactRelationship;

  @Column({ length: 20 })
  primaryPhone: string;

  @Column({ length: 20, nullable: true })
  secondaryPhone: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'int', default: 1 })
  priority: number; // 1 = primary, 2 = secondary, etc.

  @Column({ type: 'boolean', default: true })
  canMakeMedicalDecisions: boolean;

  @Column({ type: 'boolean', default: true })
  notifyOnEmergency: boolean;

  @Column({ type: 'boolean', default: false })
  hasHealthcarePowerOfAttorney: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  // Helper method
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
