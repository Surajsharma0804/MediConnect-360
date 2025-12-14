import { registerAs } from '@nestjs/config';

/**
 * Enterprise Application Configuration
 * - Centralized configuration management
 * - Environment-specific settings
 * - Type-safe configuration access
 * - Default values for development
 */

export interface AppConfig {
  port: number;
  environment: string;
  apiUrl: string;
  corsOrigin: string[];
  jwtSecret: string;
  jwtExpiresIn: string;
  encryptionKey: string;
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  fileUpload: {
    maxSize: number;
    allowedTypes: string[];
  };
  features: {
    registration: boolean;
    emailVerification: boolean;
    twoFactor: boolean;
    videoRecording: boolean;
    aiDiagnostics: boolean;
  };
}

export default registerAs('app', (): AppConfig => ({
  port: parseInt(process.env.PORT || '5000', 10),
  environment: process.env.NODE_ENV || 'development',
  apiUrl: process.env.API_URL || 'http://localhost:5000',
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
  jwtSecret: process.env.JWT_SECRET || 'super-secret-dev-key-change-in-production-123',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  encryptionKey: process.env.ENCRYPTION_KEY || 'must-be-exactly-32-characters!!',
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  fileUpload: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
    ],
  },
  features: {
    registration: process.env.ENABLE_REGISTRATION === 'true',
    emailVerification: process.env.ENABLE_EMAIL_VERIFICATION === 'true',
    twoFactor: process.env.ENABLE_2FA === 'true',
    videoRecording: process.env.ENABLE_VIDEO_RECORDING === 'true',
    aiDiagnostics: process.env.ENABLE_AI_DIAGNOSTICS !== 'false', // Default true
  },
}));