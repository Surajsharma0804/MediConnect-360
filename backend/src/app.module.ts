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
import { AIService } from './services/ai.service';
import { StorageService } from './services/storage.service';
import { EmailService } from './services/email.service';
import { SMSService } from './services/sms.service';
import { PaymentService } from './services/payment.service';

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
  ],
})
export class AppModule {}
