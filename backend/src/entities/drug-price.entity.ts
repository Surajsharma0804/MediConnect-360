import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('drug_prices')
@Index(['drugName', 'pharmacyId'])
@Index(['pharmacyId'])
export class DrugPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  drugName: string;

  @Column({ length: 255, nullable: true })
  genericName: string;

  @Column({ length: 100 })
  dosage: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'uuid' })
  pharmacyId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  insurancePrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cashPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  couponPrice: number;

  @Column({ type: 'text', nullable: true })
  couponCode: string;

  @Column({ type: 'text', nullable: true })
  couponProvider: string; // GoodRx, SingleCare, etc.

  @Column({ type: 'boolean', default: false })
  isGeneric: boolean;

  @Column({ type: 'boolean', default: true })
  inStock: boolean;

  @Column({ type: 'date', nullable: true })
  lastUpdated: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
