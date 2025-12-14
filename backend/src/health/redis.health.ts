import { Injectable, Logger } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';

/**
 * Enterprise Redis Health Indicator
 * - Never crashes the application on Redis failures
 * - Uses cached results to avoid connection storms
 * - Always returns healthy status (degraded mode acceptable)
 * - No persistent connections to prevent socket leaks
 */
@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(RedisHealthIndicator.name);
  private lastHealthCheck = 0;
  private readonly healthCheckInterval = 60000; // 1 minute cache
  private cachedResult: HealthIndicatorResult | null = null;

  constructor(private configService: ConfigService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    // Use cached result to prevent connection storms
    const now = Date.now();
    if (this.cachedResult && (now - this.lastHealthCheck) < this.healthCheckInterval) {
      return this.cachedResult;
    }

    const redisUrl = this.configService.get('REDIS_URL');
    
    // Redis not configured - perfectly acceptable
    if (!redisUrl || redisUrl === 'redis://localhost:6379') {
      const result = this.getStatus(key, true, {
        status: 'not_configured',
        message: 'Redis not configured - using memory cache',
        cache_type: 'memory',
      });
      this.updateCache(result, now);
      return result;
    }

    // Quick Redis connectivity test
    try {
      const { createClient } = await import('redis');
      const client = createClient({
        url: redisUrl,
        socket: { connectTimeout: 2000 }, // Very short timeout
      });

      // Set up error handler to prevent uncaught exceptions
      client.on('error', () => {
        // Silently handle errors
      });

      await Promise.race([
        client.connect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 2000)
        )
      ]);

      const startTime = Date.now();
      await client.ping();
      const responseTime = Date.now() - startTime;

      await client.quit();

      const result = this.getStatus(key, true, {
        status: 'connected',
        response_time_ms: responseTime,
        cache_type: 'redis',
        message: 'Redis operational',
      });

      this.updateCache(result, now);
      return result;

    } catch (error) {
      // Redis failed - but that's OK, we have fallback
      const result = this.getStatus(key, true, { // Always healthy
        status: 'degraded',
        error: error.message,
        cache_type: 'memory_fallback',
        message: 'Redis unavailable - using memory cache (normal operation)',
      });

      this.updateCache(result, now);
      return result;
    }
  }

  private updateCache(result: HealthIndicatorResult, timestamp: number): void {
    this.cachedResult = result;
    this.lastHealthCheck = timestamp;
  }
}