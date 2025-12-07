import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { validateEnvironment } from './config/env.validation';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    // Validate environment variables before starting
    validateEnvironment();

    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Security: Enable Helmet for security headers
    if (process.env.NODE_ENV === 'production') {
      app.use(helmet());
    }

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

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

bootstrap();
