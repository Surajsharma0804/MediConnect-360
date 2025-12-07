import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { User } from './entities/user.entity';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { GoogleStrategy } from './auth/strategies/google.strategy';
import { GitHubStrategy } from './auth/strategies/github.strategy';
import { PaymentController } from './payment/payment.controller';
import { AIModule } from './ai/ai.module';
import { EHRModule } from './ehr/ehr.module';
import { ProvidersModule } from './providers/providers.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { MessagingModule } from './messaging/messaging.module';
import { FamilyModule } from './family/family.module';
import { EmergencyModule } from './emergency/emergency.module';
import { HealthTrackingModule } from './health-tracking/health-tracking.module';
import { PharmacyModule } from './pharmacy/pharmacy.module';
import { InsuranceModule } from './insurance/insurance.module';
import { LabDiagnosticsModule } from './lab-diagnostics/lab-diagnostics.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { CareCoordinationModule } from './care-coordination/care-coordination.module';
import { DocumentsModule } from './documents/documents.module';
import { RemindersModule } from './reminders/reminders.module';
import { ScheduleModule } from '@nestjs/schedule';
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

// Conditionally add OAuth strategies only if credentials are configured
const oauthProviders: any[] = [];
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  oauthProviders.push(GoogleStrategy);
}
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  oauthProviders.push(GitHubStrategy);
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(databaseConfig()),
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'super-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
    ScheduleModule.forRoot(),
    AIModule,
    EHRModule,
    ProvidersModule,
    AppointmentsModule,
    MessagingModule,
    FamilyModule,
    EmergencyModule,
    HealthTrackingModule,
    PharmacyModule,
    InsuranceModule,
    LabDiagnosticsModule,
    IntegrationsModule,
    CareCoordinationModule,
    DocumentsModule,
    RemindersModule,
  ],
  controllers: [AppController, AuthController, PaymentController],
  providers: [
    AppService,
    AuthService,
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
  ],
})
export class AppModule {}
