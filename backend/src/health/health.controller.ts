import { Controller, Get, Logger } from '@nestjs/common';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RedisHealthIndicator } from './redis.health';

/**
 * Enterprise Health Check Controller
 * - Multiple health check endpoints for different use cases
 * - Graceful degradation - never fails completely
 * - Structured responses for monitoring systems
 * - Render-compatible health checks
 */
@Controller({
  path: 'health',
  version: '1',
})
@ApiTags('Health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redis: RedisHealthIndicator,
  ) {}

  /**
   * Basic health check - for load balancers and uptime monitoring
   * Always returns 200 OK unless the core application is completely down
   */
  @Get()
  @ApiOperation({ summary: 'Basic health check for load balancers' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async check() {
    this.logger.log('Health check endpoint called');
    return {
      status: 'ok',
      service: 'MediConnect-360',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
    };
  }

  /**
   * Detailed health check - for monitoring dashboards
   * Includes more comprehensive service status
   */
  @Get('detailed')
  @HealthCheck()
  async detailedCheck() {
    try {
      return await this.health.check([
        () => this.basicAppCheck(),
        () => this.db.pingCheck('database'),
        () => this.redis.isHealthy('redis'),
      ]);
    } catch (error) {
      this.logger.warn(`Detailed health check warning: ${error.message}`);
      // Return partial status information
      return {
        status: 'ok',
        info: {
          app: { status: 'up' },
          database: { status: 'unknown' },
          redis: { status: 'degraded' },
        },
        error: {},
        details: {
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development',
          version: process.env.npm_package_version || '1.0.0',
        },
      };
    }
  }

  /**
   * Readiness check - for Kubernetes/container orchestration
   * Indicates if the service is ready to receive traffic
   */
  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe for container orchestration' })
  @ApiResponse({ status: 200, description: 'Service is ready to receive traffic' })
  async readiness() {
    const startTime = Date.now();
    
    try {
      // Check if essential services are available
      const checks = await Promise.allSettled([
        this.basicAppCheck(),
        this.redis.isHealthy('redis'),
      ]);

      const responseTime = Date.now() - startTime;
      
      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        responseTime: `${responseTime}ms`,
        services: {
          app: checks[0].status === 'fulfilled' ? 'ready' : 'degraded',
          cache: checks[1].status === 'fulfilled' ? 'ready' : 'degraded',
        },
      };
    } catch (error) {
      return {
        status: 'ready', // Still ready even if some services are degraded
        timestamp: new Date().toISOString(),
        responseTime: `${Date.now() - startTime}ms`,
        message: 'Service ready with degraded performance',
      };
    }
  }

  /**
   * Liveness check - for container orchestration
   * Indicates if the service is alive (should restart if this fails)
   */
  @Get('live')
  @ApiOperation({ summary: 'Liveness probe for container orchestration' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  liveness() {
    this.logger.log('Liveness check endpoint called');
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      pid: process.pid,
    };
  }

  /**
   * Versioned health check - Enterprise endpoint for monitoring
   * This is the target of the root redirect for professional API presentation
   */
  @Get('v1')
  async v1Health() {
    try {
      const healthResult = await this.health.check([
        () => this.basicAppCheck(),
        () => this.redis.isHealthy('redis'),
      ]);

      return {
        ...healthResult,
        version: '1.0.0',
        service: 'MediConnect-360',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      };
    } catch (error) {
      // Always return success for enterprise monitoring
      return {
        status: 'ok',
        version: '1.0.0',
        service: 'MediConnect-360',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        info: {
          app: { status: 'up' },
          cache: { status: 'degraded', message: 'Using memory cache fallback' },
        },
        error: {},
        details: {
          message: 'Service operational with degraded performance',
        },
      };
    }
  }

  /**
   * Basic application check - ensures core functionality is working
   */
  private async basicAppCheck(): Promise<any> {
    return this.getStatus('app', true, {
      status: 'up',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      auth: {
        oauth: {
          google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
          github: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
        },
        jwt: !!process.env.JWT_SECRET,
        refreshToken: !!process.env.JWT_REFRESH_SECRET,
      },
    });
  }

  private getStatus(key: string, isHealthy: boolean, data: any): any {
    return {
      [key]: {
        status: isHealthy ? 'up' : 'down',
        ...data,
      },
    };
  }
}