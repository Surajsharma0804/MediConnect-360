import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

// Entities
import { User } from '../entities/user.entity';

// Controllers & Services
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TwoFactorService } from './two-factor.service';

// Strategies
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { GitHubStrategy } from './strategies/github.strategy';

// Guards
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'super-secret-key',
        signOptions: {
          expiresIn: '15m', // Short-lived access tokens
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TwoFactorService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    // Conditionally add OAuth strategies
    ...getOAuthStrategies(),
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    RolesGuard,
    PassportModule,
  ],
})
export class AuthModule {}

// Helper function to conditionally load OAuth strategies
function getOAuthStrategies(): any[] {
  const logger = new Logger('AuthModule');
  const strategies: any[] = [];

  // Google OAuth
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    strategies.push(GoogleStrategy);
    logger.log('✅ Google OAuth strategy enabled');
  } else {
    logger.warn('❌ Google OAuth disabled - credentials not configured');
  }

  // GitHub OAuth
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    strategies.push(GitHubStrategy);
    logger.log('✅ GitHub OAuth strategy enabled');
  } else {
    logger.warn('❌ GitHub OAuth disabled - credentials not configured');
  }

  logger.log(`OAuth strategies loaded: ${strategies.length}`);
  return strategies;
}