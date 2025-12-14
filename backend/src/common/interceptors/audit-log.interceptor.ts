import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import type { Request, Response } from 'express';
import { AuditLogService, AuditAction, AuditResult } from '../services/audit-log.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(private readonly auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const startTime = Date.now();

    // Extract relevant information
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || 'Unknown';
    const userId = (request as any).user?.id || null;

    // Generate request ID for tracing
    const requestId = this.generateRequestId();
    response.setHeader('X-Request-ID', requestId);

    return next.handle().pipe(
      tap(async (data) => {
        const duration = Date.now() - startTime;
        
        // Log successful operations for sensitive endpoints
        if (this.shouldAudit(url)) {
          const action = this.mapUrlToAuditAction(method, url);
          if (action) {
            await this.auditLogService.log(
              action,
              userId,
              this.extractResourceType(url),
              this.extractResourceId(url),
              {
                requestId,
                duration,
                statusCode: response.statusCode,
                userAgent,
              },
              AuditResult.SUCCESS,
              ip,
              userAgent,
            );
          }
        }
      }),
      catchError(async (error) => {
        const duration = Date.now() - startTime;
        
        // Log failed operations for sensitive endpoints
        if (this.shouldAudit(url)) {
          const action = this.mapUrlToAuditAction(method, url);
          if (action) {
            await this.auditLogService.log(
              action,
              userId,
              this.extractResourceType(url),
              this.extractResourceId(url),
              {
                requestId,
                duration,
                error: error.message,
                statusCode: error.status || 500,
                userAgent,
              },
              AuditResult.FAILURE,
              ip,
              userAgent,
            );
          }
        }

        return throwError(() => error);
      }),
    );
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldAudit(url: string): boolean {
    // Only audit sensitive endpoints to avoid log spam
    const sensitivePatterns = [
      '/auth/',
      '/users/',
      '/documents/',
      '/medical/',
      '/appointments/',
      '/prescriptions/',
      '/lab-results/',
      '/admin/',
    ];

    return sensitivePatterns.some(pattern => url.includes(pattern));
  }

  private mapUrlToAuditAction(method: string, url: string): AuditAction | null {
    // Map HTTP operations to audit actions
    if (url.includes('/auth/login')) {
      return method === 'POST' ? AuditAction.LOGIN : null;
    }
    if (url.includes('/auth/logout')) {
      return AuditAction.LOGOUT;
    }
    if (url.includes('/users/') && method === 'POST') {
      return AuditAction.USER_CREATED;
    }
    if (url.includes('/users/') && method === 'PUT') {
      return AuditAction.USER_UPDATED;
    }
    if (url.includes('/documents/') && method === 'GET') {
      return AuditAction.DOCUMENT_VIEWED;
    }
    if (url.includes('/documents/') && method === 'POST') {
      return AuditAction.DOCUMENT_UPLOADED;
    }
    if (url.includes('/medical/') && method === 'GET') {
      return AuditAction.MEDICAL_RECORD_VIEWED;
    }

    return null;
  }

  private extractResourceType(url: string): string {
    if (url.includes('/auth/')) return 'Authentication';
    if (url.includes('/users/')) return 'User';
    if (url.includes('/documents/')) return 'Document';
    if (url.includes('/medical/')) return 'MedicalRecord';
    if (url.includes('/appointments/')) return 'Appointment';
    return 'Unknown';
  }

  private extractResourceId(url: string): string | undefined {
    // Extract UUID or numeric ID from URL
    const match = url.match(/\/([a-f0-9-]{36}|\d+)(?:\/|$)/);
    return match ? match[1] : undefined;
  }
}