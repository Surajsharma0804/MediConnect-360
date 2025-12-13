import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { TerminusModule } from '@nestjs/terminus';

// Core modules
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { redisCacheConfig } from './config/cache.config';

// Entity imports
import { User } from './entities/user.entity';
import { AuditLog } from './common/entities/audit-log.entity';

// Auth modules
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { TwoFactorService } from './auth/two-factor.service';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { GoogleStrategy } from './auth/strategies/google.strategy';
import { GitHubStrategy } from './auth/strategies/github.strategy';

// Feature modules
import { HealthModule } from './health/health.module';

// Payment module
import { PaymentController } from './payment/payment.controller';

// Services
import { AIService } from './services/ai.service';
import { VoiceService } from './services/voice.service';
import { StorageService } from './services/storage.service';
import { EmailService } from './services/email.service';
import { SMSService } from './services/sms.service';
import { PaymentService } from './services/payment.service';
import { FDAService } from './services/fda.service';
import { NotificationService } from './services/notification.service';
import { AnalyticsService } from './services/analytics.service';
import { VideoService } from './services/video.service';
import { AuditLogService } from './common/services/audit-log.service';

// Logger for application startup
const logger = new Logger('AppModule');

// Conditionally add OAuth strategies only if credentials are configured
const getOAuthProviders = (): any[] => {
  const providers: any[] = [];
  
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(GoogleStrategy);
    logger.log('Google OAuth strategy enabled');
  } else {
    logger.warn('Google OAuth credentials not configured');
  }
  
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    providers.push(GitHubStrategy);
    logger.log('GitHub OAuth strategy enabled');
  } else {
    logger.warn('GitHub OAuth credentials not configured');
  }
  
  return providers;
};

const oauthProviders = getOAuthProviders();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(databaseConfig()),
    TypeOrmModule.forFeature([
      User, 
      AuditLog,
      // Add other entities as needed for advanced features
    ]),
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'super-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
    ScheduleModule.forRoot(),
    // Rate limiting - Enhanced configuration
    ThrottlerModule.forRootAsync({
      useFactory: (configService: ConfigService) => [
        {
          name: 'short',
          ttl: 1000, // 1 second
          limit: 3, // 3 requests per second
        },
        {
          name: 'medium',
          ttl: 10000, // 10 seconds
          limit: 20, // 20 requests per 10 seconds
        },
        {
          name: 'long',
          ttl: 60000, // 1 minute
          limit: configService.get('RATE_LIMIT_MAX_REQUESTS', 100),
        },
      ],
      inject: [ConfigService],
    }),
    // Caching
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: redisCacheConfig,
    }),
    // Background jobs - Enhanced Redis configuration
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
          password: configService.get('REDIS_PASSWORD'),
          retryDelayOnFailover: 100,
          enableReadyCheck: false,
          maxRetriesPerRequest: 3,
        },
        defaultJobOptions: {
          removeOnComplete: 10,
          removeOnFail: 5,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      }),
      inject: [ConfigService],
    }),
    
    // Health checks
    TerminusModule,
    HealthModule,
  ],
  controllers: [AppController, AuthController, PaymentController],
  providers: [
    AppService,
    AuthService,
    TwoFactorService,
    JwtStrategy,
    ...oauthProviders,
    AIService,
    StorageService,
    EmailService,
    SMSService,
    PaymentService,
    FDAService,
    NotificationService,
    AnalyticsService,
    VideoService,
    VoiceService,
    AuditLogService,
  ],
})
export class AppModule {}
