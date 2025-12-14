import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Enterprise Exception Filter
 * - Centralized error handling for all exceptions
 * - Structured error responses for API consistency
 * - Security-conscious error messages in production
 * - Comprehensive logging with correlation IDs
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message, errorCode } = this.getErrorDetails(exception);
    const correlationId = this.generateCorrelationId();
    const isProduction = process.env.NODE_ENV === 'production';

    // Log error with correlation ID for traceability
    this.logError(exception, request, correlationId, status);

    // Send structured error response
    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      correlationId,
      error: {
        code: errorCode,
        message: isProduction ? this.sanitizeErrorMessage(message) : message,
        ...(isProduction ? {} : { details: this.getErrorDetails(exception) }),
      },
    };

    response.status(status).json(errorResponse);
  }

  private getErrorDetails(exception: unknown): {
    status: number;
    message: string;
    errorCode: string;
  } {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      return {
        status: exception.getStatus(),
        message: typeof response === 'string' ? response : (response as any).message || 'HTTP Exception',
        errorCode: exception.constructor.name,
      };
    }

    // Handle specific error types
    if (exception instanceof Error) {
      // Redis connection errors should not crash the app
      if (this.isRedisError(exception)) {
        return {
          status: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'Cache service temporarily unavailable',
          errorCode: 'CACHE_UNAVAILABLE',
        };
      }

      // Database connection errors
      if (this.isDatabaseError(exception)) {
        return {
          status: HttpStatus.SERVICE_UNAVAILABLE,
          message: 'Database service temporarily unavailable',
          errorCode: 'DATABASE_UNAVAILABLE',
        };
      }

      // Validation errors
      if (this.isValidationError(exception)) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: exception.message,
          errorCode: 'VALIDATION_ERROR',
        };
      }
    }

    // Default internal server error
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      errorCode: 'INTERNAL_ERROR',
    };
  }

  private isRedisError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return message.includes('redis') || 
           message.includes('socket closed') || 
           message.includes('econnrefused') ||
           message.includes('connection timeout');
  }

  private isDatabaseError(error: Error): boolean {
    const message = error.message.toLowerCase();
    return message.includes('database') ||
           message.includes('connection') ||
           message.includes('postgresql') ||
           message.includes('typeorm');
  }

  private isValidationError(error: Error): boolean {
    return error.name === 'ValidationError' || 
           error.message.includes('validation failed');
  }

  private sanitizeErrorMessage(message: string): string {
    // Remove sensitive information from error messages in production
    const sensitivePatterns = [
      /password/gi,
      /token/gi,
      /secret/gi,
      /key/gi,
      /credential/gi,
    ];

    let sanitized = message;
    sensitivePatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });

    return sanitized;
  }

  private generateCorrelationId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private logError(
    exception: unknown,
    request: Request,
    correlationId: string,
    status: number,
  ): void {
    const errorMessage = exception instanceof Error ? exception.message : 'Unknown error';
    const stack = exception instanceof Error ? exception.stack : undefined;

    this.logger.error(
      `[${correlationId}] ${request.method} ${request.url} - ${status} - ${errorMessage}`,
      {
        correlationId,
        method: request.method,
        url: request.url,
        statusCode: status,
        userAgent: request.get('User-Agent'),
        ip: request.ip,
        stack,
      },
    );
  }
}