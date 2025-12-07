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

export enum CareTeamRole {
  PRIMARY_CARE = 'PRIMARY_CARE',
  SPECIALIST = 'SPECIALIST',
  NURSE = 'NURSE',
  THERAPIST = 'THERAPIST',
  PHARMACIST = 'PHARMACIST',
  NUTRITIONIST = 'NUTRITIONIST',
  CARE_COORDINATOR = 'CARE_COORDINATOR',
  SOCIAL_WORKER = 'SOCIAL_WORKER',
  OTHER = 'OTHER',
}

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

@Entity('care_team_members')
export class CareTeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Provider, { nullable: true })
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @Column({ name: 'provider_id', nullable: true })
  providerId: string;

  @Column({
    type: 'enum',
    enum: CareTeamRole,
  })
  role: CareTeamRole;

  @Column({
    type: 'enum',
    enum: MemberStatus,
    default: MemberStatus.ACTIVE,
  })
  status: MemberStatus;

  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;

  @Column({ type: 'text', nullable: true })
  specialization: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({
    name: 'added_date',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  addedDate: Date;

  @Column({ name: 'last_contact_date', type: 'timestamp', nullable: true })
  lastContactDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  contactInfo: {
    phone?: string;
    email?: string;
    address?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
