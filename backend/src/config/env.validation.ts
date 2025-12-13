import { Logger } from '@nestjs/common';

const logger = new Logger('EnvValidation');

export function validateEnvironment(): void {
  const requiredEnvVars = [
    'JWT_SECRET',
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    logger.warn(`Missing environment variables: ${missingVars.join(', ')}`);
    logger.warn('Using default values for development');
  }

  // Set defaults for development
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'super-secret-dev-key-change-in-production-123';
  }

  logger.log('Environment validation completed');
}