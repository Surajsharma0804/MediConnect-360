import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('medical_ids')
export class MedicalID {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  // Basic Information
  @Column({ length: 255 })
  fullName: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({ length: 10 })
  bloodType: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height: number;

  @Column({ length: 10, nullable: true })
  heightUnit: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number;

  @Column({ length: 10, nullable: true })
  weightUnit: string;

  // Medical Conditions
  @Column({ type: 'jsonb', nullable: true })
  medicalConditions: string[];

  @Column({ type: 'jsonb', nullable: true })
  allergies: string[];

  @Column({ type: 'jsonb', nullable: true })
  currentMedications: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;

  // Emergency Information
  @Column({ type: 'jsonb', nullable: true })
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
  }>;

  @Column({ length: 255, nullable: true })
  primaryPhysician: string;

  @Column({ length: 20, nullable: true })
  physicianPhone: string;

  @Column({ length: 255, nullable: true })
  preferredHospital: string;

  // Insurance Information
  @Column({ length: 255, nullable: true })
  insuranceProvider: string;

  @Column({ length: 100, nullable: true })
  insurancePolicyNumber: string;

  @Column({ length: 100, nullable: true })
  insuranceGroupNumber: string;

  // Additional Information
  @Column({ type: 'boolean', default: false })
  isOrganDonor: boolean;

  @Column({ type: 'text', nullable: true })
  specialInstructions: string;

  @Column({ type: 'text', nullable: true })
  advanceDirectives: string;

  @Column({ type: 'boolean', default: false })
  hasPacemaker: boolean;

  @Column({ type: 'boolean', default: false })
  hasImplants: boolean;

  @Column({ type: 'text', nullable: true })
  implantDetails: string;

  // Accessibility
  @Column({ type: 'boolean', default: true })
  isVisibleToEmergencyServices: boolean;

  @Column({ type: 'boolean', default: false })
  requiresInterpreter: boolean;

  @Column({ length: 100, nullable: true })
  preferredLanguage: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper method
  get age(): number {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }
}
