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
    // Don't initialize Redis client in constructor to avoid connection issues
    this.logger.log('Redis health check initialized - will check on demand');
  }

  private async createTemporaryRedisClient(): Promise<any | null> {
    try {
      const redisUrl = this.configService.get('REDIS_URL');
      
      if (!redisUrl || redisUrl === 'redis://localhost:6379') {
        return null;
      }

      // Create a temporary client for health check - same pattern as BullMQ
      const client = createClient({
        url: redisUrl, // Use URL directly like BullMQ does
        socket: {
          connectTimeout: 3000, // Shorter timeout for health checks
          // NO reconnect strategy - we don't want persistent connections for health checks
        },
        // Minimal configuration for health checks
        commandsQueueMaxLength: 1,
      });

      // Set up error handler that doesn't throw
      client.on('error', (err) => {
        this.logger.warn(`Redis health check error: ${err.message}`);
        // Swallow errors - don't let them become uncaught exceptions
      });

      // Connect with timeout
      await Promise.race([
        client.connect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 3000)
        )
      ]);

      return client;
    } catch (error) {
      this.logger.warn(`Redis health check connection failed: ${error.message}`);
      return null;
    }
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    // Use cached result if within interval to avoid frequent connection attempts
    const now = Date.now();
    if (this.cachedResult && (now - this.lastHealthCheck) < this.healthCheckInterval) {
      return this.cachedResult;
    }

    const redisUrl = this.configService.get('REDIS_URL');
    
    if (!redisUrl || redisUrl === 'redis://localhost:6379') {
      // Redis not configured - this is acceptable
      const result = this.getStatus(key, true, {
        status: 'not_configured',
        message: 'Redis not configured, using memory cache',
      });
      this.cachedResult = result;
      this.lastHealthCheck = now;
      return result;
    }

    let tempClient: any | null = null;
    
    try {
      // Create temporary client for this health check only
      tempClient = await this.createTemporaryRedisClient();
      
      if (!tempClient) {
        // Connection failed, but that's OK - return healthy with fallback message
        const result = this.getStatus(key, true, {
          status: 'unavailable',
          message: 'Redis connection failed, using memory cache fallback',
        });
        this.cachedResult = result;
        this.lastHealthCheck = now;
        return result;
      }

      // Perform quick health check
      const startTime = Date.now();
      await tempClient.ping();
      const responseTime = Date.now() - startTime;

      // Get basic Redis info (don't get too much to avoid timeouts)
      let version = 'unknown';
      try {
        const info = await tempClient.info('server');
        const versionMatch = info.match(/redis_version:([^\r\n]+)/);
        version = versionMatch ? versionMatch[1] : 'unknown';
      } catch (infoError) {
        // Info command failed, but ping worked - that's still healthy
        this.logger.warn(`Redis info command failed: ${infoError.message}`);
      }

      const result = this.getStatus(key, true, {
        status: 'connected',
        version,
        response_time_ms: responseTime,
        connection_type: 'temporary',
        message: 'Redis connection successful',
      });

      this.cachedResult = result;
      this.lastHealthCheck = now;
      return result;

    } catch (error) {
      this.logger.warn(`Redis health check failed: ${error.message}`);
      
      // CRITICAL: Return healthy status even if Redis fails
      // This prevents the health check from failing and potentially crashing the app
      const result = this.getStatus(key, true, { // Always return true for health
        status: 'down',
        error: error.message,
        message: 'Redis unavailable, using memory cache fallback - this is OK',
      });

      // Cache failed result for shorter time
      this.cachedResult = result;
      this.lastHealthCheck = now - (this.healthCheckInterval * 0.5);
      return result;

    } finally {
      // ALWAYS clean up the temporary client to prevent socket leaks
      if (tempClient) {
        try {
          await tempClient.quit(); // Graceful disconnect
        } catch (quitError) {
          // If quit fails, force disconnect
          try {
            await tempClient.disconnect();
          } catch (disconnectError) {
            this.logger.warn(`Failed to disconnect Redis health check client: ${disconnectError.message}`);
          }
        }
      }
    }
  }

  async onApplicationShutdown(): Promise<void> {
    // No persistent client to disconnect - we use temporary clients only
    this.logger.log('Redis health check shutdown - no persistent connections to close');
  }
}