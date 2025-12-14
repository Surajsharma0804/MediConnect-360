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
import { Exclude } from 'class-transformer';

export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
  NURSE = 'nurse',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

export enum BloodType {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
}

@Entity('users')
@Index('IDX_USER_EMAIL', ['email']) // Index for faster email lookups
@Index('IDX_USER_ROLE', ['role']) // Index for role-based queries
@Index('IDX_USER_ACTIVE_VERIFIED', ['isActive', 'isEmailVerified']) // Composite index for active verified users
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ nullable: true, select: false }) // Don't select password by default
  @Exclude() // Exclude from JSON responses
  password: string;

  @Column({ length: 255 })
  name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PATIENT,
  })
  role: UserRole;

  @Column({ nullable: true, length: 20 })
  phone: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender;

  @Column({
    type: 'enum',
    enum: BloodType,
    nullable: true,
  })
  bloodType: BloodType;

  @Column({ nullable: true, length: 500 })
  profileImage: string;

  @Column({ default: 'en', length: 10 })
  languagePreference: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true, unique: true, length: 255 })
  googleId: string;

  @Column({ nullable: true, unique: true, length: 255 })
  githubId: string;

  @Column({ nullable: true, length: 50 })
  oauthProvider: string;

  @Column({ nullable: true, length: 255 })
  oauthProviderId: string;

  @Column({ nullable: true, length: 500 })
  profilePicture: string;

  @Column({ nullable: true, length: 500 })
  bio: string;

  @Column({ nullable: true, length: 255 })
  timezone: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // For extensibility

  @Column({ default: 0 })
  loginAttempts: number; // Track failed login attempts

  @Column({ type: 'timestamp', nullable: true })
  lockedUntil: Date | null; // Account lockout timestamp

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin: Date;

  @Column({ type: 'timestamp', nullable: true })
  emailVerifiedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date; // Soft delete for HIPAA compliance

  // Two-Factor Authentication fields
  @Column({ default: false })
  isTwoFactorEnabled: boolean;

  @Column({ type: 'text', nullable: true, select: false })
  @Exclude()
  twoFactorSecret: string | null;

  @Column({ type: 'text', array: true, default: [] })
  @Exclude()
  twoFactorBackupCodes: string[];

  // Hooks
  @BeforeInsert()
  @BeforeUpdate()
  normalizeEmail() {
    if (this.email) {
      this.email = this.email.toLowerCase().trim();
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  normalizeName() {
    if (this.name) {
      this.name = this.name.trim();
    }
  }

  // Helper methods
  isLocked(): boolean {
    return !!(this.lockedUntil && this.lockedUntil > new Date());
  }

  incrementLoginAttempts(): void {
    this.loginAttempts += 1;
    // Lock account after 5 failed attempts for 30 minutes
    if (this.loginAttempts >= 5) {
      this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
    }
  }

  resetLoginAttempts(): void {
    this.loginAttempts = 0;
    this.lockedUntil = null;
  }
}
