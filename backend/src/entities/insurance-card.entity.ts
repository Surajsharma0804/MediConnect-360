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

  @Column()
  userId: string;

  @Column()
  insuranceProvider: string;

  @Column()
  policyNumber: string;

  @Column()
  groupNumber: string;

  @Column()
  memberName: string;

  @Column()
  memberId: string;

  @Column({ nullable: true })
  effectiveDate: Date;

  @Column({ nullable: true })
  expirationDate: Date;

  @Column({ nullable: true })
  planType: string;

  @Column({ nullable: true })
  copayAmount: string;

  @Column({ nullable: true })
  deductibleAmount: string;

  @Column({ nullable: true })
  deductible: string;

  @Column({ nullable: true })
  deductibleMet: string;

  @Column({ nullable: true })
  copayPrimaryCare: string;

  @Column({ nullable: true })
  copaySpecialist: string;

  @Column({ nullable: true })
  copayEmergency: string;

  @Column({ nullable: true })
  copayUrgentCare: string;

  @Column({ nullable: true })
  frontImageUrl: string;

  @Column({ nullable: true })
  backImageUrl: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}