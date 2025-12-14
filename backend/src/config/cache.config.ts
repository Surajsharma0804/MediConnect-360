import { CacheModuleOptions } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { Logger } from '@nestjs/common';

const logger = new Logger('RedisConfig');

// Redis connection now uses URL directly - no need for separate options interface

class RedisConnectionManager {
  private static instance: RedisConnectionManager;
  private connectionAttempts = 0;
  private maxRetries = 5;
  private retryDelay = 2000;
  private circuitBreakerOpen = false;
  private lastFailureTime = 0;
  private circuitBreakerTimeout = 60000; // 1 minute

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
        logger.log('Circuit breaker timeout expired, attempting to reconnect');
        this.circuitBreakerOpen = false;
        this.connectionAttempts = 0;
      }
    }
    return this.circuitBreakerOpen;
  }

  private openCircuitBreaker(): void {
    this.circuitBreakerOpen = true;
    this.lastFailureTime = Date.now();
    logger.warn(`Redis circuit breaker opened after ${this.connectionAttempts} failed attempts`);
  }

  async createRedisStore(redisUrl: string): Promise<any> {
    if (this.isCircuitBreakerOpen()) {
      logger.warn('Redis circuit breaker is open, using memory cache');
      return null;
    }

    try {
      this.connectionAttempts++;
      logger.log(`Redis connection attempt ${this.connectionAttempts}/${this.maxRetries} using URL`);

      // Use URL-based connection ONLY - this handles TLS automatically for Upstash
      const redisClientConfig = {
        url: redisUrl,
        socket: {
          connectTimeout: 10000,
          reconnectStrategy: (retries: number) => {
            if (retries > 10) {
              logger.error('Redis reconnection attempts exceeded, giving up');
              return false;
            }
            const delay = Math.min(retries * 100, 3000);
            logger.log(`Redis reconnecting in ${delay}ms (attempt ${retries})`);
            return delay;
          },
        },
        // Enterprise Redis client configuration
        commandsQueueMaxLength: 1000,
      };

      // Add reconnection error handler
      const store = await redisStore(redisClientConfig);
      
      // Add connection event handlers for monitoring
      if (store && typeof store.client?.on === 'function') {
        store.client.on('connect', () => {
          logger.log('✅ Redis cache client connected');
        });
        
        store.client.on('error', (err: Error) => {
          logger.error(`❌ Redis cache client error: ${err.message}`);
        });
        
        store.client.on('reconnecting', () => {
          logger.log('🔄 Redis cache client reconnecting...');
        });
        
        store.client.on('ready', () => {
          logger.log('✅ Redis cache client ready');
        });
      }

      // Reset connection attempts on successful connection
      this.connectionAttempts = 0;
      this.circuitBreakerOpen = false;
      logger.log(`✅ Redis connection established successfully`);
      
      return store;
    } catch (error) {
      logger.error(`❌ Redis connection failed (attempt ${this.connectionAttempts}/${this.maxRetries}): ${error.message}`);
      
      if (this.connectionAttempts >= this.maxRetries) {
        this.openCircuitBreaker();
      }
      
      // Wait before next retry
      if (this.connectionAttempts < this.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        this.retryDelay = Math.min(this.retryDelay * 1.5, 10000); // Exponential backoff
      }
      
      return null;
    }
  }
}

export const redisCacheConfig = async (): Promise<CacheModuleOptions> => {
  const connectionManager = RedisConnectionManager.getInstance();
  
  // Use Redis URL directly - this is the ONLY correct way for Upstash
  const redisUrl = process.env.REDIS_URL;
  
  if (redisUrl && redisUrl !== 'redis://localhost:6379') {
    try {
      // Use URL directly - NO parsing, NO host/port extraction
      const store = await connectionManager.createRedisStore(redisUrl);
      if (store) {
        logger.log('✅ Redis cache store created successfully');
        return {
          store,
          ttl: 300000, // 5 minutes in milliseconds
          max: 1000, // Maximum number of items in cache
        };
      }
    } catch (error) {
      logger.error(`Failed to create Redis store: ${error.message}`);
    }
  }

  // Production-grade memory cache fallback
  logger.warn('🔄 Using memory cache - Redis not available or configured');
  return {
    ttl: 300000, // 5 minutes in milliseconds
    max: 1000, // Maximum number of items in cache
    // Memory cache options for production
    updateAgeOnGet: false,
    updateAgeOnHas: false,
  };
};