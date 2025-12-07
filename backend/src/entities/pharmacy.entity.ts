import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('pharmacies')
@Index(['zipCode'])
@Index(['city', 'state'])
@Index(['isOpen24Hours'])
export class Pharmacy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 100, nullable: true })
  chain: string; // CVS, Walgreens, Walmart, etc.

  @Column({ type: 'text' })
  address: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 50 })
  state: string;

  @Column({ length: 20 })
  zipCode: string;

  @Column({ length: 100, nullable: true })
  country: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 20, nullable: true })
  fax: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 255, nullable: true })
  website: string;

  @Column({ type: 'jsonb', nullable: true })
  hours: Record<string, string>; // { "monday": "9:00-21:00", ... }

  @Column({ type: 'boolean', default: false })
  isOpen24Hours: boolean;

  @Column({ type: 'boolean', default: true })
  acceptsEPrescriptions: boolean;

  @Column({ type: 'boolean', default: false })
  offersDelivery: boolean;

  @Column({ type: 'boolean', default: false })
  offersDriveThru: boolean;

  @Column({ type: 'boolean', default: false })
  hasImmunizations: boolean;

  @Column({ type: 'jsonb', nullable: true })
  services: string[]; // ["flu_shots", "covid_testing", "compounding"]

  @Column({ type: 'jsonb', nullable: true })
  insuranceAccepted: string[];

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  reviewCount: number;

  @Column({ type: 'int', default: 30, nullable: true })
  averageWaitTime: number; // in minutes

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
