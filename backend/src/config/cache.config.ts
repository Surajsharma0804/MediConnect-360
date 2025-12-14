import { CacheModuleOptions } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

export const redisCacheConfig = async (): Promise<CacheModuleOptions> => {
  // Parse Redis URL if provided (Upstash format: redis://default:password@host:port)
  const redisUrl = process.env.REDIS_URL;
  
  if (redisUrl && redisUrl !== 'redis://localhost:6379') {
    try {
      const url = new URL(redisUrl);
      console.log('Connecting to Redis:', url.hostname + ':' + (url.port || 6379));
      return {
        store: await redisStore({
          socket: {
            host: url.hostname,
            port: parseInt(url.port) || 6379,
            connectTimeout: 10000,
            lazyConnect: true,
          },
          password: url.password || undefined,
          username: url.username !== 'default' ? url.username : undefined,
        }),
        ttl: 300, // 5 minutes default TTL
      };
    } catch (error) {
      console.error('Failed to connect to Redis, falling back to memory cache:', error.message);
    }
  }

  // If no Redis URL or localhost, use memory cache
  console.warn('Redis not configured or localhost detected, using memory cache');
  return {
    ttl: 300, // 5 minutes default TTL
  };
};