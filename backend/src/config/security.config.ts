import { Logger } from '@nestjs/common';

const logger = new Logger('SecurityConfig');

export interface SecurityConfig {
  jwt: {
    secret: string;
    refreshSecret: string;
    accessTokenExpiry: string;
    refreshTokenExpiry: string;
    issuer: string;
    audience: string;
  };
  encryption: {
    algorithm: string;
    keyLength: number;
    ivLength: number;
  };
  rateLimit: {
    auth: {
      windowMs: number;
      max: number;
    };
    api: {
      windowMs: number;
      max: number;
    };
    strict: {
      windowMs: number;
      max: number;
    };
  };
  session: {
    maxAge: number;
    secure: boolean;
    httpOnly: boolean;
    sameSite: 'strict' | 'lax' | 'none';
  };
  password: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge: number; // days
    preventReuse: number; // number of previous passwords to check
  };
  account: {
    maxLoginAttempts: number;
    lockoutDuration: number; // minutes
    sessionTimeout: number; // minutes
    maxConcurrentSessions: number;
  };
  audit: {
    retentionPeriod: number; // days
    sensitiveFields: string[];
    logLevel: 'minimal' | 'standard' | 'detailed';
  };
}

export const getSecurityConfig = (): SecurityConfig => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Validate critical security environment variables
  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
  
  if (!jwtSecret || jwtSecret.length < 32) {
    if (isProduction) {
      throw new Error('JWT_SECRET must be at least 32 characters in production');
    }
    logger.warn('JWT_SECRET is weak or missing - using default for development');
  }
  
  if (!jwtRefreshSecret || jwtRefreshSecret.length < 32) {
    if (isProduction) {
      throw new Error('JWT_REFRESH_SECRET must be at least 32 characters in production');
    }
    logger.warn('JWT_REFRESH_SECRET is weak or missing - using default for development');
  }

  return {
    jwt: {
      secret: jwtSecret || 'dev-jwt-secret-change-in-production-min-32-chars',
      refreshSecret: jwtRefreshSecret || 'dev-refresh-secret-change-in-production-min-32-chars',
      accessTokenExpiry: '15m',
      refreshTokenExpiry: '7d',
      issuer: 'mediconnect-360',
      audience: 'mediconnect-users',
    },
    encryption: {
      algorithm: 'aes-256-gcm',
      keyLength: 32,
      ivLength: 16,
    },
    rateLimit: {
      auth: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: isProduction ? 5 : 10, // Stricter in production
      },
      api: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: isProduction ? 100 : 1000,
      },
      strict: {
        windowMs: 60 * 1000, // 1 minute
        max: 3, // Very strict for sensitive operations
      },
    },
    session: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: isProduction,
      httpOnly: true,
      sameSite: 'lax',
    },
    password: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxAge: 90, // Force password change every 90 days
      preventReuse: 5, // Prevent reusing last 5 passwords
    },
    account: {
      maxLoginAttempts: 5,
      lockoutDuration: 30, // 30 minutes
      sessionTimeout: 60, // 60 minutes of inactivity
      maxConcurrentSessions: 3,
    },
    audit: {
      retentionPeriod: isProduction ? 2555 : 30, // 7 years for HIPAA compliance in prod
      sensitiveFields: [
        'password',
        'token',
        'secret',
        'key',
        'ssn',
        'creditCard',
        'bankAccount',
        'medicalRecord',
      ],
      logLevel: isProduction ? 'standard' : 'detailed',
    },
  };
};

export const validateSecurityConfig = (config: SecurityConfig): void => {
  const errors: string[] = [];

  // Validate JWT configuration
  if (config.jwt.secret.length < 32) {
    errors.push('JWT secret must be at least 32 characters');
  }

  if (config.jwt.refreshSecret.length < 32) {
    errors.push('JWT refresh secret must be at least 32 characters');
  }

  // Validate rate limiting
  if (config.rateLimit.auth.max < 3) {
    errors.push('Auth rate limit must allow at least 3 attempts');
  }

  // Validate password policy
  if (config.password.minLength < 8) {
    errors.push('Minimum password length must be at least 8 characters');
  }

  if (errors.length > 0) {
    throw new Error(`Security configuration errors: ${errors.join(', ')}`);
  }

  logger.log('✅ Security configuration validated successfully');
};

// Export singleton instance
export const securityConfig = getSecurityConfig();
validateSecurityConfig(securityConfig);