import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';

const logger = new Logger('DatabaseConfig');

/**
 * Enterprise Database Configuration
 * - Production-ready PostgreSQL settings
 * - Connection pooling and retry logic
 * - SSL configuration for cloud databases
 * - Comprehensive logging and monitoring
 */

export const databaseConfig = (): TypeOrmModuleOptions => {
  const databaseUrl = process.env.DATABASE_URL;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!databaseUrl) {
    if (isProduction) {
      throw new Error('DATABASE_URL is required in production');
    }
    logger.warn('DATABASE_URL not configured - using in-memory database for development');
    return createInMemoryConfig();
  }

  logger.log('Configuring PostgreSQL database connection');

  return {
    type: 'postgres',
    url: databaseUrl,
    
    // SSL Configuration for cloud databases (Neon, etc.)
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    
    // Connection Pool Settings
    extra: {
      connectionLimit: 10,
      acquireTimeout: 60000,
      timeout: 60000,
      
      // Connection pool configuration
      max: isProduction ? 20 : 5, // Maximum connections
      min: 2, // Minimum connections
      idle: 10000, // Idle timeout
      
      // Retry configuration
      retry: {
        max: 3,
        timeout: 5000,
      },
    },

    // Entity Configuration
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    
    // Migration Settings
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    migrationsRun: false, // Don't auto-run migrations
    
    // Schema Synchronization (enabled for testing — use migrations for real production)
    synchronize: true,
    
    // Logging Configuration
    logging: isProduction ? ['error', 'warn'] : ['query', 'error', 'warn'],
    logger: 'advanced-console',
    
    // Performance Settings
    cache: {
      duration: 30000, // 30 seconds
      type: 'database',
    },
    
    // Connection Options
    connectTimeoutMS: 10000,
    
    // Naming Strategy
    namingStrategy: undefined, // Use default naming
    
    // Development Settings
    dropSchema: false, // Never drop schema automatically
  };
};

function createInMemoryConfig(): TypeOrmModuleOptions {
  logger.warn('Using SQLite in-memory database for development');
  
  return {
    type: 'sqlite',
    database: ':memory:',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
    logging: ['error', 'warn'],
    dropSchema: false,
  };
}