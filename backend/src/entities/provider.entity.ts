import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

export enum ProviderStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
  SUSPENDED = 'suspended',
}

export enum ProviderType {
  DOCTOR = 'doctor',
  NURSE_PRACTITIONER = 'nurse_practitioner',
  PHYSICIAN_ASSISTANT = 'physician_assistant',
  THERAPIST = 'therapist',
  PSYCHIATRIST = 'psychiatrist',
  PSYCHOLOGIST = 'psychologist',
  NUTRITIONIST = 'nutritionist',
  PHYSICAL_THERAPIST = 'physical_therapist',
  SPECIALIST = 'specialist',
}

@Entity('providers')
@Index(['email'])
@Index(['status'])
@Index(['rating'])
export class Provider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255 })
  firstName: string;

  @Column({ length: 255 })
  lastName: string;

  @Column({ length: 255, nullable: true })
  title: string; // Dr., MD, DO, NP, PA, etc.

  @Column({
    type: 'enum',
    enum: ProviderType,
  })
  type: ProviderType;

  @Column({ type: 'jsonb' })
  specializations: string[]; // e.g., ['Cardiology', 'Internal Medicine']

  @Column({ length: 100, nullable: true })
  licenseNumber: string;

  @Column({ length: 100, nullable: true })
  npiNumber: string; // National Provider Identifier

  @Column({ type: 'jsonb', nullable: true })
  certifications: string[];

  @Column({ type: 'jsonb', nullable: true })
  languages: string[];

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'text', nullable: true })
  education: string;

  @Column({ type: 'int', default: 0 })
  yearsOfExperience: number;

  @Column({ length: 500, nullable: true })
  profileImage: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  officeAddress: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  state: string;

  @Column({ length: 20, nullable: true })
  zipCode: string;

  @Column({ length: 100, nullable: true })
  country: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number; // 0.00 to 5.00

  @Column({ type: 'int', default: 0 })
  totalReviews: number;

  @Column({ type: 'int', default: 0 })
  totalConsultations: number;

  @Column({ type: 'jsonb', nullable: true })
  availability: Record<string, any>; // Weekly schedule

  @Column({ type: 'int', default: 30 })
  consultationDuration: number; // minutes

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  consultationFee: number;

  @Column({ type: 'boolean', default: true })
  acceptsNewPatients: boolean;

  @Column({ type: 'boolean', default: true })
  offersVideoConsultation: boolean;

  @Column({ type: 'boolean', default: false })
  offersInPersonConsultation: boolean;

  @Column({ type: 'boolean', default: false })
  offersHomeVisit: boolean;

  @Column({ type: 'jsonb', nullable: true })
  insuranceAccepted: string[];

  @Column({ type: 'jsonb', nullable: true })
  conditionsTreated: string[];

  @Column({ type: 'jsonb', nullable: true })
  proceduresPerformed: string[];

  @Column({
    type: 'enum',
    enum: ProviderStatus,
    default: ProviderStatus.ACTIVE,
  })
  status: ProviderStatus;

  @Column({ type: 'boolean', default: true })
  isVerified: boolean;

  @Column({ type: 'date', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  awards: Array<{
    name: string;
    year: number;
    organization: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  publications: Array<{
    title: string;
    journal: string;
    year: number;
    url?: string;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastActiveAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  // Hooks
  @BeforeInsert()
  @BeforeUpdate()
  normalizeEmail() {
    if (this.email) {
      this.email = this.email.toLowerCase().trim();
    }
  }

  // Helper methods
  get fullName(): string {
    return `${this.title || ''} ${this.firstName} ${this.lastName}`.trim();
  }

  get averageRating(): number {
    return this.totalReviews > 0 ? this.rating : 0;
  }
}
