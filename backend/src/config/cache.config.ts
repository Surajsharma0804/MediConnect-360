import { CacheModuleOptions } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

export const redisCacheConfig = async (): Promise<CacheModuleOptions> => {
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
    // Fallback to memory cache if Redis is not available
    console.warn('Redis not available, falling back to memory cache');
    return {
      ttl: 300,
    };
  }
};