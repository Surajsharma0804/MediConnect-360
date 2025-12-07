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

export enum AllergySeverity {
  MILD = 'mild',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  LIFE_THREATENING = 'life_threatening',
}

export enum AllergyType {
  MEDICATION = 'medication',
  FOOD = 'food',
  ENVIRONMENTAL = 'environmental',
  INSECT = 'insect',
  LATEX = 'latex',
  OTHER = 'other',
}

@Entity('allergies')
@Index(['userId'])
@Index(['allergen'])
export class Allergy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ length: 255 })
  allergen: string;

  @Column({
    type: 'enum',
    enum: AllergyType,
  })
  type: AllergyType;

  @Column({
    type: 'enum',
    enum: AllergySeverity,
  })
  severity: AllergySeverity;

  @Column({ type: 'jsonb', nullable: true })
  reactions: string[]; // e.g., ['rash', 'hives', 'difficulty breathing']

  @Column({ type: 'date', nullable: true })
  firstOccurrence: Date;

  @Column({ type: 'date', nullable: true })
  lastOccurrence: Date;

  @Column({ type: 'text', nullable: true })
  treatment: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ length: 255, nullable: true })
  diagnosedBy: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date;
}
