import { CacheModuleOptions } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

export const cacheConfig: CacheModuleOptions = {
  isGlobal: true,
  ttl: 300, // 5 minutes default
  max: 100, // Maximum number of items in cache
};

export const redisCacheConfig = async (): Promise<CacheModuleOptions> => {
  if (process.env.REDIS_URL) {
    return {
      store: await redisStore({
        url: process.env.REDIS_URL,
        ttl: 300,
      }),
      isGlobal: true,
    };
  }
  return cacheConfig;
};
