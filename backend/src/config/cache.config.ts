import { CacheModuleOptions } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { Logger } from '@nestjs/common';

const logger = new Logger('RedisConfig');

/**
 * Enterprise Redis Configuration
 * - Single connection strategy using URL only
 * - Circuit breaker pattern for fault tolerance
 * - Graceful fallback to memory cache
 * - Production-ready error handling
 */

class RedisConnectionManager {
  private static instance: RedisConnectionManager;
  private connectionAttempts = 0;
  private readonly maxRetries = 3; // Reduced for faster fallback
  private retryDelay = 1000; // Start with 1 second
  private circuitBreakerOpen = false;
  private lastFailureTime = 0;
  private readonly circuitBreakerTimeout = 30000; // 30 seconds

  static getInstance(): RedisConnectionManager {
    if (!RedisConnectionManager.instance) {
      RedisConnectionManager.instance = new RedisConnectionManager();
    }
    return RedisConnectionManager.instance;
  }

  private isCircuitBreakerOpen(): boolean {
    if (this.circuitBreakerOpen) {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure > this.circuitBreakerTimeout) {
        logger.log('Redis circuit breaker timeout expired, attempting reconnect');
        this.circuitBreakerOpen = false;
        this.connectionAttempts = 0;
        this.retryDelay = 1000; // Reset delay
      }
    }
    return this.circuitBreakerOpen;
  }

  private openCircuitBreaker(): void {
    this.circuitBreakerOpen = true;
    this.lastFailureTime = Date.now();
    logger.warn(`Redis circuit breaker opened after ${this.connectionAttempts} attempts`);
  }

  async createRedisStore(redisUrl: string): Promise<any> {
    if (this.isCircuitBreakerOpen()) {
      return null;
    }

    try {
      this.connectionAttempts++;
      logger.log(`Redis connection attempt ${this.connectionAttempts}/${this.maxRetries}`);

      const store = await redisStore({
        url: redisUrl,
        socket: {
          connectTimeout: 5000, // 5 second timeout
          reconnectStrategy: (retries: number) => {
            if (retries > 5) return false;
            return Math.min(retries * 500, 2000);
          },
        },
        commandsQueueMaxLength: 100, // Reduced for better performance
      });

      // Add minimal event handlers
      if (store?.client?.on) {
        store.client.on('error', (err: Error) => {
          logger.warn(`Redis cache error: ${err.message}`);
        });
      }

      // Reset on success
      this.connectionAttempts = 0;
      this.circuitBreakerOpen = false;
      logger.log('✅ Redis cache store connected');
      
      return store;
    } catch (error) {
      logger.warn(`Redis connection failed (${this.connectionAttempts}/${this.maxRetries}): ${error.message}`);
      
      if (this.connectionAttempts >= this.maxRetries) {
        this.openCircuitBreaker();
      }
      
      return null;
    }
  }
}

export const redisCacheConfig = async (): Promise<CacheModuleOptions> => {
  const redisUrl = process.env.REDIS_URL;
  
  // Skip Redis if not configured or using default local URL
  if (!redisUrl || redisUrl === 'redis://localhost:6379') {
    logger.log('Using memory cache - Redis not configured');
    return createMemoryCacheConfig();
  }

  try {
    const connectionManager = RedisConnectionManager.getInstance();
    const store = await connectionManager.createRedisStore(redisUrl);
    
    if (store) {
      return {
        store,
        ttl: 300000, // 5 minutes
        max: 1000,
      };
    }
  } catch (error) {
    logger.warn(`Redis store creation failed: ${error.message}`);
  }

  // Always fallback to memory cache
  logger.log('Falling back to memory cache');
  return createMemoryCacheConfig();
};

function createMemoryCacheConfig(): CacheModuleOptions {
  return {
    ttl: 300000, // 5 minutes
    max: 500, // Smaller for memory efficiency
    updateAgeOnGet: false,
    updateAgeOnHas: false,
  };
}