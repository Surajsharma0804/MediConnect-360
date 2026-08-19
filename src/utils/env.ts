/**
 * Environment Configuration & Validation
 * 
 * Centralized config for all VITE_ environment variables used in the frontend.
 * Validates required vars at startup and provides type-safe access.
 */

interface EnvConfig {
  // API
  API_BASE_URL: string;
  ENV: string;
  
  // Auth
  GOOGLE_CLIENT_ID: string;
  GITHUB_CLIENT_ID: string;
  
  // Firebase
  FIREBASE_API_KEY: string;
  FIREBASE_AUTH_DOMAIN: string;
  FIREBASE_PROJECT_ID: string;
  FIREBASE_STORAGE_BUCKET: string;
  FIREBASE_MESSAGING_SENDER_ID: string;
  FIREBASE_APP_ID: string;
  FIREBASE_VAPID_KEY: string;
  
  // Payments
  STRIPE_PUBLISHABLE_KEY: string;
  
  // Video
  JITSI_DOMAIN: string;
  
  // Monitoring
  SENTRY_DSN: string;
  GA_MEASUREMENT_ID: string;
  
  // Feature flags
  ENABLE_AI: boolean;
  ENABLE_VIDEO: boolean;
  ENABLE_EMERGENCY: boolean;
  
  // Environment
  IS_PRODUCTION: boolean;
  IS_DEVELOPMENT: boolean;
  
  // App
  APP_NAME: string;
  APP_VERSION: string;
}

function loadConfig(): EnvConfig {
  const env = import.meta.env;
  
  return {
    // API
    API_BASE_URL: env.VITE_API_URL || 'http://localhost:5000',
    ENV: env.VITE_ENV || 'development',
    
    // Auth
    GOOGLE_CLIENT_ID: env.VITE_GOOGLE_CLIENT_ID || '',
    GITHUB_CLIENT_ID: env.VITE_GITHUB_CLIENT_ID || '',
    
    // Firebase
    FIREBASE_API_KEY: env.VITE_FIREBASE_API_KEY || '',
    FIREBASE_AUTH_DOMAIN: env.VITE_FIREBASE_AUTH_DOMAIN || '',
    FIREBASE_PROJECT_ID: env.VITE_FIREBASE_PROJECT_ID || '',
    FIREBASE_STORAGE_BUCKET: env.VITE_FIREBASE_STORAGE_BUCKET || '',
    FIREBASE_MESSAGING_SENDER_ID: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    FIREBASE_APP_ID: env.VITE_FIREBASE_APP_ID || '',
    FIREBASE_VAPID_KEY: env.VITE_FIREBASE_VAPID_KEY || '',
    
    // Payments
    STRIPE_PUBLISHABLE_KEY: env.VITE_STRIPE_PUBLISHABLE_KEY || '',
    
    // Video
    JITSI_DOMAIN: env.VITE_JITSI_DOMAIN || 'meet.jit.si',
    
    // Monitoring
    SENTRY_DSN: env.VITE_SENTRY_DSN || '',
    GA_MEASUREMENT_ID: env.VITE_GA_MEASUREMENT_ID || '',
    
    // Feature flags
    ENABLE_AI: env.VITE_ENABLE_AI !== 'false',
    ENABLE_VIDEO: env.VITE_ENABLE_VIDEO !== 'false',
    ENABLE_EMERGENCY: env.VITE_ENABLE_EMERGENCY !== 'false',
    
    // Environment
    IS_PRODUCTION: env.PROD === true,
    IS_DEVELOPMENT: env.DEV === true,
    
    // App
    APP_NAME: 'MediConnect 360',
    APP_VERSION: env.VITE_APP_VERSION || '1.0.0',
  };
}

export const config = loadConfig();

/**
 * Validates environment variables. Returns array of warnings.
 * Call at app startup (main.tsx).
 */
export function validateEnv(): string[] {
  const warnings: string[] = [];
  
  // Production-only checks
  if (config.IS_PRODUCTION) {
    if (!config.API_BASE_URL || config.API_BASE_URL.includes('localhost')) {
      warnings.push('VITE_API_URL should point to production API, not localhost');
    }
    if (!config.GOOGLE_CLIENT_ID || config.GOOGLE_CLIENT_ID.includes('your-')) {
      warnings.push('VITE_GOOGLE_CLIENT_ID must be set for Google OAuth');
    }
    if (!config.STRIPE_PUBLISHABLE_KEY || config.STRIPE_PUBLISHABLE_KEY.includes('test')) {
      warnings.push('VITE_STRIPE_PUBLISHABLE_KEY should use live key in production');
    }
    if (!config.SENTRY_DSN) {
      warnings.push('VITE_SENTRY_DSN recommended for production error tracking');
    }
  }
  
  // Always validate
  if (!config.API_BASE_URL) {
    warnings.push('VITE_API_URL is not set — API calls will fail');
  }
  
  // Log results
  if (warnings.length > 0) {
    const prefix = config.IS_PRODUCTION ? '[CRITICAL]' : '[WARNING]';
    console.warn(
      `${prefix} Environment validation:\n${warnings.map(w => `  - ${w}`).join('\n')}`
    );
  }
  
  return warnings;
}

/**
 * Security headers for API requests
 */
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
};

export default config;
