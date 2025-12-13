import { CacheModuleOptions } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

export const redisCacheConfig = async (): Promise<CacheModuleOptions> => {
  // Parse Redis URL if provided (Upstash format: redis://default:password@host:port)
  const redisUrl = process.env.REDIS_URL;
  
  if (redisUrl) {
    try {
      const url = new URL(redisUrl);
      return {
        store: await redisStore({
          socket: {
            host: url.hostname,
            port: parseInt(url.port) || 6379,
          },
          password: url.password || undefined,
          username: url.username !== 'default' ? url.username : undefined,
        }),
        ttl: 300, // 5 minutes default TTL
      };
    } catch (error) {
      console.error('Failed to parse REDIS_URL:', error);
    }
  }

  // Fallback to individual Redis environment variables
  try {
    return {
      store: await redisStore({
        socket: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        },
        password: process.env.REDIS_PASSWORD,
      }),
      ttl: 300, // 5 minutes default TTL
    };
  } catch (error) {
    // Final fallback to memory cache if Redis is not available
    console.warn('Redis not available, falling back to memory cache');
    return {
      ttl: 300,
    };
  }
};