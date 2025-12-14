import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('audit_logs')
@Index(['userId', 'timestamp']) // For user-specific audit queries
@Index(['resourceType', 'resourceId']) // For resource-specific audit queries
@Index(['action', 'timestamp']) // For action-specific queries
@Index(['timestamp']) // For time-based queries
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  action: string; // AuditAction enum value

  @Column({ type: 'uuid', nullable: true })
  userId: string; // User who performed the action

  @Column({ nullable: true, length: 100 })
  resourceType: string; // Type of resource affected (User, Patient, Appointment, etc.)

  @Column({ type: 'uuid', nullable: true })
  resourceId: string; // ID of the affected resource

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any>; // Additional context about the action

  @Column({ length: 20, default: 'SUCCESS' })
  result: string; // SUCCESS, FAILURE, WARNING

  @Column({ nullable: true, length: 45 })
  ipAddress: string; // IP address of the user

  @Column({ nullable: true, length: 500 })
  userAgent: string; // User agent string

  @CreateDateColumn()
  timestamp: Date; // When the action occurred

  @Column({ nullable: true, length: 100 })
  sessionId: string; // Session identifier

  @Column({ nullable: true, length: 100 })
  correlationId: string; // For tracking related actions

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Additional metadata for compliance
}