import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class SanitizeInterceptor implements NestInterceptor {
  private readonly dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<link/gi,
    /<meta/gi,
    /expression\s*\(/gi,
    /url\s*\(/gi,
    /@import/gi,
  ];

  private readonly sqlInjectionPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /('|(\\')|(;)|(\\;)|(\|)|(\*)|(%)|(<)|(>)|(\{)|(\})|(\[)|(\]))/gi,
    /((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>)/gi,
    /((\%3C)|<)((\%69)|i|(\%49))((\%6D)|m|(\%4D))((\%67)|g|(\%47))[^\n]+((\%3E)|>)/gi,
  ];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    // Sanitize request body
    if (request.body) {
      request.body = this.sanitizeObject(request.body);
    }

    // Sanitize query parameters
    if (request.query) {
      request.query = this.sanitizeObject(request.query);
    }

    // Sanitize URL parameters
    if (request.params) {
      request.params = this.sanitizeObject(request.params);
    }

    return next.handle().pipe(
      map((data) => {
        // Sanitize response data (be careful not to break functionality)
        return this.sanitizeResponse(data);
      }),
    );
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[this.sanitizeString(key)] = this.sanitizeObject(value);
      }
      return sanitized;
    }

    return obj;
  }

  private sanitizeString(input: string): string {
    if (typeof input !== 'string') {
      return input;
    }

    let sanitized = input;

    // Check for dangerous patterns
    for (const pattern of this.dangerousPatterns) {
      if (pattern.test(sanitized)) {
        throw new BadRequestException('Potentially malicious content detected');
      }
    }

    // Check for SQL injection patterns
    for (const pattern of this.sqlInjectionPatterns) {
      if (pattern.test(sanitized)) {
        throw new BadRequestException('Potentially malicious SQL content detected');
      }
    }

    // Basic HTML entity encoding for safety
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');

    // Trim whitespace
    sanitized = sanitized.trim();

    return sanitized;
  }

  private sanitizeResponse(data: any): any {
    // Only sanitize string fields that might contain user input
    // Be careful not to break API responses
    if (typeof data === 'object' && data !== null) {
      if (data.message && typeof data.message === 'string') {
        // Sanitize error messages to prevent information leakage
        data.message = this.sanitizeErrorMessage(data.message);
      }
    }

    return data;
  }

  private sanitizeErrorMessage(message: string): string {
    // Remove sensitive information from error messages
    return message
      .replace(/password/gi, '[REDACTED]')
      .replace(/token/gi, '[REDACTED]')
      .replace(/secret/gi, '[REDACTED]')
      .replace(/key/gi, '[REDACTED]')
      .replace(/database/gi, 'storage')
      .replace(/sql/gi, 'query');
  }
}