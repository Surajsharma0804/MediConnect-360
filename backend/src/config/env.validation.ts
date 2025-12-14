import { Logger } from '@nestjs/common';

const logger = new Logger('EnvValidation');

interface EnvironmentConfig {
  required: string[];
  optional: { [key: string]: string };
  production: string[];
}

const ENV_CONFIG: EnvironmentConfig = {
  required: [
    'JWT_SECRET',
  ],
  optional: {
    NODE_ENV: 'development',
    PORT: '5000',
    JWT_EXPIRES_IN: '7d',
    CORS_ORIGIN: 'http://localhost:5173',
    LOG_LEVEL: 'debug',
  },
  production: [
    'DATABASE_URL',
    'JWT_SECRET',
    'ENCRYPTION_KEY',
  ],
};

export function validateEnvironment(): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const requiredVars = isProduction ? ENV_CONFIG.production : ENV_CONFIG.required;
  
  // Check required variables
  const missingRequired = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingRequired.length > 0) {
    if (isProduction) {
      logger.error(`Missing required environment variables: ${missingRequired.join(', ')}`);
      throw new Error(`Production deployment requires: ${missingRequired.join(', ')}`);
    } else {
      logger.warn(`Missing environment variables: ${missingRequired.join(', ')}`);
      logger.warn('Using default values for development');
    }
  }

  // Set defaults for development
  if (!isProduction) {
    Object.entries(ENV_CONFIG.optional).forEach(([key, defaultValue]) => {
      if (!process.env[key]) {
        process.env[key] = defaultValue;
        logger.debug(`Set default ${key}=${defaultValue}`);
      }
    });
  }

  // Validate critical security settings
  validateSecuritySettings();

  logger.log(`Environment validation completed (${process.env.NODE_ENV})`);
}

function validateSecuritySettings(): void {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // JWT Secret validation
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret) {
    if (jwtSecret.length < 32) {
      const message = 'JWT_SECRET must be at least 32 characters long';
      if (isProduction) {
        throw new Error(message);
      } else {
        logger.warn(message);
      }
    }
    
    if (jwtSecret.includes('super-secret') || jwtSecret.includes('change-in-production')) {
      const message = 'JWT_SECRET appears to be a default value - change in production';
      if (isProduction) {
        throw new Error(message);
      } else {
        logger.warn(message);
      }
    }
  }

  // Encryption key validation
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (encryptionKey && encryptionKey.length !== 32) {
    const message = 'ENCRYPTION_KEY must be exactly 32 characters for AES-256';
    if (isProduction) {
      throw new Error(message);
    } else {
      logger.warn(message);
    }
  }

  // CORS validation
  if (isProduction && process.env.CORS_ORIGIN === 'http://localhost:5173') {
    logger.warn('CORS_ORIGIN is set to localhost in production');
  }
}