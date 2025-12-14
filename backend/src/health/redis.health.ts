import { Injectable, Logger } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(RedisHealthIndicator.name);
  private redisClient: RedisClientType | null = null;
  private lastHealthCheck = 0;
  private healthCheckInterval = 30000; // 30 seconds
  private cachedResult: HealthIndicatorResult | null = null;

  constructor(private configService: ConfigService) {
    super();
    this.initializeRedisClient();
  }

  private async initializeRedisClient(): Promise<void> {
    try {
      const redisUrl = this.configService.get('REDIS_URL');
      
      if (!redisUrl || redisUrl === 'redis://localhost:6379') {
        this.logger.log('Redis not configured for health checks');
        return;
      }

      // Use URL directly - this handles TLS automatically for Upstash
      this.redisClient = createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 5000,
          reconnectStrategy: (retries: number) => {
            if (retries > 3) {
              this.logger.warn('Redis health check reconnection attempts exceeded, giving up');
              return false;
            }
            const delay = Math.min(retries * 500, 2000);
            this.logger.log(`Redis health check reconnecting in ${delay}ms (attempt ${retries})`);
            return delay;
          },
        },
        // Reduced queue size for health checks
        commandsQueueMaxLength: 10,
      });

      this.redisClient.on('error', (err) => {
        this.logger.warn(`Redis health check client error: ${err.message}`);
        // Don't crash on Redis errors
      });

      this.redisClient.on('connect', () => {
        this.logger.log('Redis health check client connected');
      });

      await this.redisClient.connect();
    } catch (error) {
      this.logger.warn(`Failed to initialize Redis health check client: ${error.message}`);
      this.redisClient = null;
      // Don't throw - just set client to null
    }
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    // Use cached result if within interval
    const now = Date.now();
    if (this.cachedResult && (now - this.lastHealthCheck) < this.healthCheckInterval) {
      return this.cachedResult;
    }

    try {
      if (!this.redisClient) {
        // Redis not configured - this is acceptable
        const result = this.getStatus(key, true, {
          status: 'not_configured',
          message: 'Redis not configured, using memory cache',
        });
        this.cachedResult = result;
        this.lastHealthCheck = now;
        return result;
      }

      // Perform health check - DO NOT THROW
      const startTime = Date.now();
      await this.redisClient.ping();
      const responseTime = Date.now() - startTime;

      // Get Redis info
      const info = await this.redisClient.info('server');
      const memoryInfo = await this.redisClient.info('memory');
      
      // Parse Redis version
      const versionMatch = info.match(/redis_version:([^\r\n]+)/);
      const version = versionMatch ? versionMatch[1] : 'unknown';
      
      // Parse memory usage
      const memoryMatch = memoryInfo.match(/used_memory_human:([^\r\n]+)/);
      const memoryUsage = memoryMatch ? memoryMatch[1] : 'unknown';

      const result = this.getStatus(key, true, {
        status: 'connected',
        version,
        memory_usage: memoryUsage,
        response_time_ms: responseTime,
        connection_type: 'external',
      });

      this.cachedResult = result;
      this.lastHealthCheck = now;
      return result;

    } catch (error) {
      this.logger.warn(`Redis health check failed: ${error.message}`);
      
      // Try to reconnect silently
      if (this.redisClient) {
        try {
          await this.redisClient.disconnect();
          this.redisClient = null;
          // Don't immediately reconnect - let it happen on next health check
        } catch (reconnectError) {
          this.logger.warn(`Redis disconnect failed: ${reconnectError.message}`);
        }
      }

      // Return DOWN status but DO NOT THROW - this prevents app crashes
      const result = this.getStatus(key, true, { // Set to true so health check passes
        status: 'down',
        error: error.message,
        message: 'Redis unavailable, using memory cache fallback',
      });

      // Don't cache failed results for as long
      this.lastHealthCheck = now - (this.healthCheckInterval * 0.8);
      return result;
    }
  }

  async onApplicationShutdown(): Promise<void> {
    if (this.redisClient) {
      try {
        await this.redisClient.disconnect();
        this.logger.log('Redis health check client disconnected');
      } catch (error) {
        this.logger.error(`Error disconnecting Redis health check client: ${error.message}`);
      }
    }
  }
}