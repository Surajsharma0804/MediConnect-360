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

export enum DocumentType {
  LAB_REPORT = 'LAB_REPORT',
  IMAGING_REPORT = 'IMAGING_REPORT',
  PRESCRIPTION = 'PRESCRIPTION',
  DISCHARGE_SUMMARY = 'DISCHARGE_SUMMARY',
  CONSULTATION_NOTE = 'CONSULTATION_NOTE',
  INSURANCE_DOCUMENT = 'INSURANCE_DOCUMENT',
  CONSENT_FORM = 'CONSENT_FORM',
  REFERRAL = 'REFERRAL',
  VACCINATION_RECORD = 'VACCINATION_RECORD',
  MEDICAL_CERTIFICATE = 'MEDICAL_CERTIFICATE',
  INVOICE = 'INVOICE',
  OTHER = 'OTHER',
}

export enum DocumentStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

@Entity('medical_documents')
export class MedicalDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => Provider, { nullable: true })
  @JoinColumn({ name: 'uploaded_by_provider_id' })
  uploadedByProvider: Provider;

  @Column({ name: 'uploaded_by_provider_id', nullable: true })
  uploadedByProviderId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
  })
  documentType: DocumentType;

  @Column({ name: 'file_url' })
  fileUrl: string;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'file_size' })
  fileSize: number; // in bytes

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.ACTIVE,
  })
  status: DocumentStatus;

  @Column({ name: 'document_date', type: 'timestamp', nullable: true })
  documentDate: Date;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ name: 'is_shared', default: false })
  isShared: boolean;

  @Column({ type: 'jsonb', nullable: true })
  sharedWith: Array<{
    providerId?: string;
    userId?: string;
    sharedAt: string;
    expiresAt?: string;
  }>;

  @Column({ name: 'thumbnail_url', nullable: true })
  thumbnailUrl: string;

  @Column({ name: 'ocr_text', type: 'text', nullable: true })
  ocrText: string; // Extracted text from document

  @Column({ name: 'is_encrypted', default: true })
  isEncrypted: boolean;

  @Column({ name: 'version', default: 1 })
  version: number;

  @Column({ name: 'parent_document_id', nullable: true })
  parentDocumentId: string; // For versioning

  @Column({ name: 'parent_id', nullable: true })
  parentId: string; // Alternative naming for parent document

  @Column({ name: 'share_token', nullable: true })
  shareToken?: string;

  @Column({ name: 'share_expires_at', nullable: true })
  shareExpiresAt?: Date;

  @Column({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @Column({ name: 'uploaded_at', nullable: true })
  uploadedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
