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

export enum Relationship {
  SPOUSE = 'spouse',
  CHILD = 'child',
  PARENT = 'parent',
  SIBLING = 'sibling',
  GRANDPARENT = 'grandparent',
  GRANDCHILD = 'grandchild',
  OTHER = 'other',
}

export enum AccessLevel {
  FULL = 'full',
  LIMITED = 'limited',
  VIEW_ONLY = 'view_only',
  EMERGENCY_ONLY = 'emergency_only',
}

@Entity('family_members')
@Index(['primaryUserId'])
@Index(['dependentUserId'])
export class FamilyMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  primaryUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'primaryUserId' })
  primaryUser: User;

  @Column({ type: 'uuid', nullable: true })
  dependentUserId: string; // If dependent has their own account

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'dependentUserId' })
  dependentUser: User;

  @Column({ length: 255 })
  firstName: string;

  @Column({ length: 255 })
  lastName: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({ length: 10 })
  gender: string;

  @Column({
    type: 'enum',
    enum: Relationship,
  })
  relationship: Relationship;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({
    type: 'enum',
    enum: AccessLevel,
    default: AccessLevel.FULL,
  })
  accessLevel: AccessLevel;

  @Column({ type: 'boolean', default: true })
  canViewMedicalRecords: boolean;

  @Column({ type: 'boolean', default: true })
  canBookAppointments: boolean;

  @Column({ type: 'boolean', default: false })
  canManagePrescriptions: boolean;

  @Column({ type: 'boolean', default: false })
  isEmergencyContact: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ length: 500, nullable: true })
  profileImage: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  // Helper method
  get age(): number {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}
