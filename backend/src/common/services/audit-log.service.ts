import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

export enum AuditAction {
  // Authentication
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  TWO_FACTOR_ENABLED = 'TWO_FACTOR_ENABLED',
  TWO_FACTOR_DISABLED = 'TWO_FACTOR_DISABLED',
  
  // User Management
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_LOCKED = 'USER_LOCKED',
  USER_UNLOCKED = 'USER_UNLOCKED',
  
  // Medical Records
  MEDICAL_RECORD_VIEWED = 'MEDICAL_RECORD_VIEWED',
  MEDICAL_RECORD_CREATED = 'MEDICAL_RECORD_CREATED',
  MEDICAL_RECORD_UPDATED = 'MEDICAL_RECORD_UPDATED',
  MEDICAL_RECORD_DELETED = 'MEDICAL_RECORD_DELETED',
  
  // Appointments
  APPOINTMENT_CREATED = 'APPOINTMENT_CREATED',
  APPOINTMENT_UPDATED = 'APPOINTMENT_UPDATED',
  APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
  APPOINTMENT_COMPLETED = 'APPOINTMENT_COMPLETED',
  
  // Prescriptions
  PRESCRIPTION_CREATED = 'PRESCRIPTION_CREATED',
  PRESCRIPTION_UPDATED = 'PRESCRIPTION_UPDATED',
  PRESCRIPTION_FILLED = 'PRESCRIPTION_FILLED',
  
  // Lab Results
  LAB_RESULT_VIEWED = 'LAB_RESULT_VIEWED',
  LAB_RESULT_CREATED = 'LAB_RESULT_CREATED',
  LAB_RESULT_UPDATED = 'LAB_RESULT_UPDATED',
  
  // Documents
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  DOCUMENT_VIEWED = 'DOCUMENT_VIEWED',
  DOCUMENT_DOWNLOADED = 'DOCUMENT_DOWNLOADED',
  DOCUMENT_DELETED = 'DOCUMENT_DELETED',
  
  // Messaging
  MESSAGE_SENT = 'MESSAGE_SENT',
  MESSAGE_VIEWED = 'MESSAGE_VIEWED',
  
  // System
  SYSTEM_BACKUP = 'SYSTEM_BACKUP',
  SYSTEM_RESTORE = 'SYSTEM_RESTORE',
  CONFIGURATION_CHANGED = 'CONFIGURATION_CHANGED',
  
  // Privacy & Compliance
  DATA_EXPORTED = 'DATA_EXPORTED',
  DATA_DELETED = 'DATA_DELETED',
  CONSENT_GIVEN = 'CONSENT_GIVEN',
  CONSENT_WITHDRAWN = 'CONSENT_WITHDRAWN',
}

export enum AuditResult {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  WARNING = 'WARNING',
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  /**
   * Log an audit event
   */
  async log(
    action: AuditAction,
    userId?: string,
    resourceType?: string,
    resourceId?: string,
    details?: Record<string, any>,
    result: AuditResult = AuditResult.SUCCESS,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      const auditLog = this.auditLogRepository.create({
        action,
        userId,
        resourceType,
        resourceId,
        details,
        result,
        ipAddress,
        userAgent,
        timestamp: new Date(),
      });

      await this.auditLogRepository.save(auditLog);

      // Also log to application logger for immediate visibility
      this.logger.log(
        `AUDIT: ${action} - User: ${userId || 'SYSTEM'} - Resource: ${resourceType}:${resourceId} - Result: ${result}`,
      );
    } catch (error) {
      // Critical: Audit logging should never fail silently
      this.logger.error('Failed to save audit log', error);
      // In production, you might want to send this to a separate monitoring system
    }
  }

  /**
   * Log successful authentication
   */
  async logLogin(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.log(
      AuditAction.LOGIN,
      userId,
      'User',
      userId,
      { loginTime: new Date() },
      AuditResult.SUCCESS,
      ipAddress,
      userAgent,
    );
  }

  /**
   * Log failed authentication
   */
  async logLoginFailed(email: string, reason: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.log(
      AuditAction.LOGIN_FAILED,
      undefined,
      'User',
      email,
      { reason, attemptTime: new Date() },
      AuditResult.FAILURE,
      ipAddress,
      userAgent,
    );
  }

  /**
   * Log medical record access (HIPAA requirement)
   */
  async logMedicalRecordAccess(
    userId: string,
    patientId: string,
    recordType: string,
    recordId: string,
    ipAddress?: string,
  ): Promise<void> {
    await this.log(
      AuditAction.MEDICAL_RECORD_VIEWED,
      userId,
      recordType,
      recordId,
      { patientId, accessTime: new Date() },
      AuditResult.SUCCESS,
      ipAddress,
    );
  }

  /**
   * Log data export (GDPR requirement)
   */
  async logDataExport(
    userId: string,
    exportedUserId: string,
    dataTypes: string[],
    ipAddress?: string,
  ): Promise<void> {
    await this.log(
      AuditAction.DATA_EXPORTED,
      userId,
      'DataExport',
      exportedUserId,
      { dataTypes, exportTime: new Date() },
      AuditResult.SUCCESS,
      ipAddress,
    );
  }

  /**
   * Log data deletion (GDPR requirement)
   */
  async logDataDeletion(
    userId: string,
    deletedUserId: string,
    dataTypes: string[],
    ipAddress?: string,
  ): Promise<void> {
    await this.log(
      AuditAction.DATA_DELETED,
      userId,
      'DataDeletion',
      deletedUserId,
      { dataTypes, deletionTime: new Date() },
      AuditResult.SUCCESS,
      ipAddress,
    );
  }

  /**
   * Get audit logs for a specific user (for compliance reporting)
   */
  async getUserAuditLogs(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100,
  ): Promise<AuditLog[]> {
    const query = this.auditLogRepository
      .createQueryBuilder('audit')
      .where('audit.userId = :userId', { userId })
      .orderBy('audit.timestamp', 'DESC')
      .limit(limit);

    if (startDate) {
      query.andWhere('audit.timestamp >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('audit.timestamp <= :endDate', { endDate });
    }

    return query.getMany();
  }

  /**
   * Get audit logs for a specific resource (e.g., patient record)
   */
  async getResourceAuditLogs(
    resourceType: string,
    resourceId: string,
    limit: number = 100,
  ): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: {
        resourceType,
        resourceId,
      },
      order: {
        timestamp: 'DESC',
      },
      take: limit,
    });
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalEvents: number;
    eventsByAction: Record<string, number>;
    failedEvents: number;
    uniqueUsers: number;
  }> {
    const query = this.auditLogRepository
      .createQueryBuilder('audit')
      .where('audit.timestamp BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    const logs = await query.getMany();

    const eventsByAction: Record<string, number> = {};
    const uniqueUsers = new Set<string>();
    let failedEvents = 0;

    logs.forEach(log => {
      eventsByAction[log.action] = (eventsByAction[log.action] || 0) + 1;
      if (log.userId) {
        uniqueUsers.add(log.userId);
      }
      if (log.result === AuditResult.FAILURE) {
        failedEvents++;
      }
    });

    return {
      totalEvents: logs.length,
      eventsByAction,
      failedEvents,
      uniqueUsers: uniqueUsers.size,
    };
  }
}