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
import { AIModule } from './ai/ai.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { CareCoordinationModule } from './care-coordination/care-coordination.module';
import { DocumentsModule } from './documents/documents.module';
import { EHRModule } from './ehr/ehr.module';
import { EmergencyModule } from './emergency/emergency.module';
import { FamilyModule } from './family/family.module';
import { HealthTrackingModule } from './health-tracking/health-tracking.module';
import { InsuranceModule } from './insurance/insurance.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { LabDiagnosticsModule } from './lab-diagnostics/lab-diagnostics.module';
import { MessagingModule } from './messaging/messaging.module';
import { PharmacyModule } from './pharmacy/pharmacy.module';
import { ProvidersModule } from './providers/providers.module';
import { RemindersModule } from './reminders/reminders.module';

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
      // All entities enabled for full functionality
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
    // Background jobs - Enterprise Redis configuration with circuit breaker
    BullModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('BullMQConfig');
        
        // Use Redis URL directly - this is the ONLY correct way for Upstash
        const redisUrl = configService.get('REDIS_URL');

        if (!redisUrl || redisUrl === 'redis://localhost:6379') {
          logger.warn('BullMQ disabled - no Redis URL configured');
          return {}; // Return empty config to disable BullMQ
        }

        try {
          logger.log(`🔄 BullMQ connecting to Redis using URL`);
          
          return {
            redis: redisUrl, // Use URL directly - BullMQ supports this and handles TLS automatically
          // Enterprise job configuration
          defaultJobOptions: {
            removeOnComplete: 50, // Keep more completed jobs for monitoring
            removeOnFail: 20, // Keep failed jobs for debugging
            attempts: 5, // More retry attempts for production
            backoff: {
              type: 'exponential',
              delay: 2000,
            },
            // Job timeout and delay settings
            delay: 0,
            timeout: 30000, // 30 second timeout
            // Priority and rate limiting
            priority: 0,
            // Repeat job configuration
            repeat: undefined,
          },
          // Advanced BullMQ settings for production
          settings: {
            stalledInterval: 30000, // Check for stalled jobs every 30 seconds
            maxStalledCount: 3, // Maximum number of times a job can be stalled
          },
        };
        } catch (error) {
          logger.error(`BullMQ configuration failed: ${error.message}`);
          logger.warn('BullMQ disabled due to configuration error');
          return {}; // Return empty config to disable BullMQ
        }
      },
      inject: [ConfigService],
    }),
    
    // Health checks
    TerminusModule,
    HealthModule,
    
    // Feature modules - All enabled
    AIModule,
    AppointmentsModule,
    CareCoordinationModule,
    DocumentsModule,
    EHRModule,
    EmergencyModule,
    FamilyModule,
    HealthTrackingModule,
    InsuranceModule,
    IntegrationsModule,
    LabDiagnosticsModule,
    MessagingModule,
    PharmacyModule,
    ProvidersModule,
    RemindersModule,
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
