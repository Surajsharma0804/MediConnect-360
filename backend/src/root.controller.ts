import { Controller, Get, Head } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * Root Controller - Industry Standard Implementation
 * 
 * Handles true root path (/) with NO prefix - exactly like Stripe, AWS, etc.
 * Provides service metadata and status information at the root level.
 * 
 * Architecture:
 * - / → Service metadata and info
 * - /api/* → Actual APIs  
 * - /api/health → Health probes
 * - Frontend → Separate deployment (Vercel)
 */
@Controller() // ⚠️ NO PREFIX - This is the key!
@ApiTags('Root')
export class RootController {
  
  /**
   * Root GET endpoint - Service metadata and information
   * Industry standard: Provides service info, not redirects
   */
  @Get()
  @ApiOperation({ 
    summary: 'Service information',
    description: 'Returns service metadata and available endpoints - industry standard root response'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Service information and metadata',
    schema: {
      type: 'object',
      properties: {
        service: { type: 'string' },
        status: { type: 'string' },
        version: { type: 'string' },
        api: { type: 'string' },
        health: { type: 'string' },
        documentation: { type: 'string' }
      }
    }
  })
  root() {
    return {
      service: 'MediConnect 360 Backend',
      status: 'running',
      version: '1.0.0',
      api: '/api',
      health: '/api/health',
      documentation: '/api/docs',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Root HEAD endpoint - Lightweight monitoring probe
   * Used by monitoring systems for quick health checks
   */
  @Head()
  @ApiOperation({ 
    summary: 'Root HEAD probe',
    description: 'Lightweight health probe for monitoring systems - returns 200 OK if service is alive'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Service is alive and responding' 
  })
  head() {
    // Return nothing - just 200 OK status
    return;
  }

  /**
   * Basic health endpoint at root level
   * Provides quick health status for monitoring
   */
  @Get('health')
  @ApiOperation({ 
    summary: 'Basic health check',
    description: 'Quick health status check at root level'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Service health status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        timestamp: { type: 'string' },
        service: { type: 'string' },
        version: { type: 'string' }
      }
    }
  })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'MediConnect 360 Backend',
      version: '1.0.0',
    };
  }
}