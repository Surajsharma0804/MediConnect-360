import { Logger } from '@nestjs/common';

const logger = new Logger('EnvValidation');

interface RequiredEnvVars {
  name: string;
  description: string;
  critical: boolean;
}

const REQUIRED_ENV_VARS: RequiredEnvVars[] = [
  {
    name: 'DATABASE_URL',
    description: 'PostgreSQL connection string',
    critical: true,
  },
  {
    name: 'JWT_SECRET',
    description: 'JWT signing secret',
    critical: true,
  },
  {
    name: 'GEMINI_API_KEY',
    description: 'Google Gemini AI API key',
    critical: true,
  },
  {
    name: 'RESEND_API_KEY',
    description: 'Resend email API key',
    critical: false,
  },
  {
    name: 'CORS_ORIGIN',
    description: 'Allowed CORS origins',
    critical: false,
  },
];

const OPTIONAL_ENV_VARS: RequiredEnvVars[] = [
  {
    name: 'GOOGLE_CLIENT_ID',
    description: 'Google OAuth client ID',
    critical: false,
  },
  {
    name: 'GOOGLE_CLIENT_SECRET',
    description: 'Google OAuth client secret',
    critical: false,
  },
  {
    name: 'GITHUB_CLIENT_ID',
    description: 'GitHub OAuth client ID',
    critical: false,
  },
  {
    name: 'GITHUB_CLIENT_SECRET',
    description: 'GitHub OAuth client secret',
    critical: false,
  },
  {
    name: 'STRIPE_SECRET_KEY',
    description: 'Stripe secret key',
    critical: false,
  },
  {
    name: 'AWS_ACCESS_KEY_ID',
    description: 'AWS S3 access key',
    critical: false,
  },
  {
    name: 'AWS_SECRET_ACCESS_KEY',
    description: 'AWS S3 secret key',
    critical: false,
  },
];

export function validateEnvironment(): void {
  logger.log('Validating environment variables...');

  const missing: RequiredEnvVars[] = [];
  const warnings: RequiredEnvVars[] = [];

  // Check required variables
  for (const envVar of REQUIRED_ENV_VARS) {
    if (!process.env[envVar.name]) {
      if (envVar.critical) {
        missing.push(envVar);
      } else {
        warnings.push(envVar);
      }
    }
  }

  // Check optional variables
  for (const envVar of OPTIONAL_ENV_VARS) {
    if (!process.env[envVar.name]) {
      logger.warn(`Optional: ${envVar.name} not set - ${envVar.description}`);
    }
  }

  // Report warnings
  if (warnings.length > 0) {
    logger.warn('\n⚠️  Missing recommended environment variables:');
    warnings.forEach((envVar) => {
      logger.warn(`   - ${envVar.name}: ${envVar.description}`);
    });
  }

  // Report critical errors
  if (missing.length > 0) {
    logger.error('\n❌ Missing critical environment variables:');
    missing.forEach((envVar) => {
      logger.error(`   - ${envVar.name}: ${envVar.description}`);
    });
    logger.error('\nPlease set these variables in your .env file');
    logger.error('See .env.example for reference\n');
    throw new Error('Missing critical environment variables');
  }

  // Validate JWT_SECRET strength
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret && jwtSecret.length < 32) {
    logger.warn(
      '⚠️  JWT_SECRET is too short. Use at least 32 characters for production.',
    );
  }

  // Validate production settings
  if (process.env.NODE_ENV === 'production') {
    const productionChecks = [
      {
        condition: jwtSecret === 'super-secret-key',
        message: 'Using default JWT_SECRET in production!',
      },
      {
        condition: process.env.DATABASE_URL?.includes('password@localhost'),
        message: 'Using default database password in production!',
      },
      {
        condition:
          !process.env.CORS_ORIGIN ||
          process.env.CORS_ORIGIN.includes('localhost'),
        message: 'CORS_ORIGIN not configured for production!',
      },
    ];

    const productionWarnings = productionChecks.filter(
      (check) => check.condition,
    );

    if (productionWarnings.length > 0) {
      logger.error('\n🚨 PRODUCTION SECURITY WARNINGS:');
      productionWarnings.forEach((warning) => {
        logger.error(`   - ${warning.message}`);
      });
      logger.error('');
    }
  }

  logger.log('✅ Environment validation complete\n');
}
