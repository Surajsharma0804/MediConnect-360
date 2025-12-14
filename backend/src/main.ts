import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import compression from 'compression';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { validateEnvironment } from './config/env.validation';
import { setupSwagger } from './config/swagger.config';

// Global error handlers for Redis connection issues
const isRedisError = (error: any): boolean => {
  const errorStr = error?.message || error?.toString() || '';
  return errorStr.includes('Redis') || 
         errorStr.includes('Socket closed') || 
         errorStr.includes('ECONNREFUSED') ||
         errorStr.includes('SocketClosedUnexpectedlyError') ||
         errorStr.includes('Connection timeout');
};

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error.message);
  if (isRedisError(error)) {
    console.warn('Redis connection error - application will continue with memory cache');
    return; // Don't exit on Redis errors
  }
  console.error('Fatal error, exiting...');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  if (isRedisError(reason)) {
    console.warn('Redis connection error - application will continue with memory cache');
    return; // Don't exit on Redis errors
  }
});

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    // Validate environment variables before starting
    validateEnvironment();

    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Security: Enhanced Helmet configuration for healthcare compliance
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          scriptSrc: ["'self'", "'unsafe-eval'"], // unsafe-eval needed for development
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:", "blob:"],
          connectSrc: ["'self'", "https://api.stripe.com", "wss:", "ws:"],
          frameSrc: ["'self'", "https://js.stripe.com", "https://meet.jit.si"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
        },
      },
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
      },
      noSniff: true,
      xssFilter: true,
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      permittedCrossDomainPolicies: false,
      crossOriginEmbedderPolicy: false, // Disabled for compatibility
    }));

    // Enable compression
    app.use(compression());

    // Enable API versioning
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    // CORS Configuration
    app.enableCors({
      origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });

    // Global Exception Filter
    app.useGlobalFilters(new AllExceptionsFilter());

    // Global Logging Interceptor
    app.useGlobalInterceptors(new LoggingInterceptor());

    // Global Validation Pipe with strict settings
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // Strip properties that don't have decorators
        forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
        transform: true, // Automatically transform payloads to DTO instances
        transformOptions: {
          enableImplicitConversion: true,
        },
        disableErrorMessages: process.env.NODE_ENV === 'production', // Hide detailed errors in production
      }),
    );

    // Global API prefix
    app.setGlobalPrefix('api');

    // Setup Swagger documentation - enabled in all environments
    setupSwagger(app);

    // Graceful shutdown
    app.enableShutdownHooks();

    const port = parseInt(process.env.PORT || '5000', 10);
    await app.listen(port, '0.0.0.0');

    logger.log('\n' + '='.repeat(60));
    logger.log('🚀 MediConnect 360 Backend Server - PRODUCTION READY');
    logger.log('='.repeat(60));
    logger.log(`✅ Server: http://localhost:${port}`);
    logger.log(`✅ API: http://localhost:${port}/api`);
    logger.log(`✅ Health: http://localhost:${port}/api/health`);
    logger.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.log(
      `✅ Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`,
    );
    logger.log(
      `✅ CORS: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`,
    );
    logger.log('='.repeat(60) + '\n');
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Note: Global error handlers are already set up above to handle Redis errors gracefully

void bootstrap();
