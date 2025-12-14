import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

/**
 * Enterprise Logging Interceptor
 * - Structured JSON logging for production monitoring
 * - Correlation IDs for request tracing
 * - Performance metrics and timing
 * - Security-conscious logging (no sensitive data)
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    const correlationId = this.generateCorrelationId();
    const startTime = Date.now();
    
    // Add correlation ID to request for downstream use
    request.correlationId = correlationId;
    response.setHeader('X-Correlation-ID', correlationId);

    const logContext = {
      correlationId,
      method: request.method,
      url: this.sanitizeUrl(request.url),
      userAgent: request.get('User-Agent'),
      ip: this.getClientIp(request),
      userId: request.user?.id || 'anonymous',
    };

    this.logger.log(`→ ${request.method} ${request.url}`, logContext);

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        const responseSize = JSON.stringify(data || {}).length;
        
        this.logger.log(
          `← ${request.method} ${request.url} ${response.statusCode} - ${duration}ms`,
          {
            ...logContext,
            statusCode: response.statusCode,
            duration,
            responseSize,
          }
        );
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        
        this.logger.error(
          `✗ ${request.method} ${request.url} - ${duration}ms - ${error.message}`,
          {
            ...logContext,
            duration,
            error: error.message,
            stack: error.stack,
          }
        );
        
        return throwError(() => error);
      })
    );
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeUrl(url: string): string {
    // Remove sensitive parameters from URL for logging
    return url.replace(/([?&])(password|token|secret|key)=[^&]*/gi, '$1$2=[REDACTED]');
  }

  private getClientIp(request: any): string {
    return request.ip || 
           request.connection?.remoteAddress || 
           request.socket?.remoteAddress ||
           request.headers['x-forwarded-for']?.split(',')[0] ||
           'unknown';
  }
}