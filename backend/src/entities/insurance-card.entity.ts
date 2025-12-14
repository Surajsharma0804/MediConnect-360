import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('insurance_cards')
export class InsuranceCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  insuranceProvider: string;

  @Column({ type: 'varchar', length: 255 })
  policyNumber: string;

  @Column({ type: 'varchar', length: 255 })
  groupNumber: string;

  @Column({ type: 'varchar', length: 255 })
  memberName: string;

  @Column({ type: 'varchar', length: 255 })
  memberId: string;

  @Column({ type: 'date', nullable: true })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  expirationDate: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  planType: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  copayAmount: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  deductibleAmount: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  deductible: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  deductibleMet: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  copayPrimaryCare: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  copaySpecialist: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  copayEmergency: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  copayUrgentCare: string;

  @Column({ type: 'text', nullable: true })
  frontImageUrl: string;

  @Column({ type: 'text', nullable: true })
  backImageUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}