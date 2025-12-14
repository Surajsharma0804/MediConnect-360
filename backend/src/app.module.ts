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
import { RootController } from './root.controller';
import { databaseConfig } from './config/database.config';
import { redisCacheConfig } from './config/cache.config';
import appConfig from './config/app.config';

// Entity imports
import { User } from './entities/user.entity';
import { AuditLog } from './common/entities/audit-log.entity';

// Auth module
import { AuthModule } from './auth/auth.module';

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



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      cache: true,
      expandVariables: true,
    }),
    TypeOrmModule.forRoot(databaseConfig()),
    TypeOrmModule.forFeature([
      User, 
      AuditLog,
      // All entities enabled for full functionality
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
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
    // Background jobs - Enterprise configuration with graceful fallback
    BullModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('BullMQConfig');
        const redisUrl = configService.get('REDIS_URL');

        // Skip BullMQ if Redis not properly configured
        if (!redisUrl || redisUrl === 'redis://localhost:6379') {
          logger.log('BullMQ disabled - Redis not configured (using in-memory processing)');
          return {}; // Empty config disables BullMQ
        }

        try {
          logger.log('Configuring BullMQ with Redis URL');
          
          return {
            redis: redisUrl,
            defaultJobOptions: {
              removeOnComplete: 10, // Keep fewer jobs for memory efficiency
              removeOnFail: 5,
              attempts: 3, // Reasonable retry count
              backoff: {
                type: 'exponential',
                delay: 1000,
              },
              timeout: 30000,
            },
            settings: {
              stalledInterval: 30000,
              maxStalledCount: 2,
            },
          };
        } catch (error) {
          logger.warn(`BullMQ configuration failed: ${error.message}`);
          logger.log('BullMQ disabled - falling back to synchronous processing');
          return {};
        }
      },
      inject: [ConfigService],
    }),
    
    // Health checks
    TerminusModule,
    HealthModule,
    
    // Authentication
    AuthModule,
    
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
  controllers: [RootController, AppController, PaymentController],
  providers: [
    AppService,
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
