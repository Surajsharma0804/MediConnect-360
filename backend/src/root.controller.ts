import { Controller, Get, Head, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

/**
 * Root Controller - Enterprise Best Practice
 * 
 * Redirects root path to versioned health endpoint for:
 * - Clean API-only mindset
 * - Professional appearance
 * - Platform-friendly monitoring
 * - Enterprise-level presentation
 */
@Controller()
@ApiTags('Root')
export class RootController {
  
  /**
   * Root GET endpoint - Redirects to versioned health check
   * This provides a clean, professional response when someone visits the root URL
   */
  @Get()
  @ApiOperation({ 
    summary: 'Root endpoint redirect',
    description: 'Redirects to the versioned health check endpoint for monitoring and status verification'
  })
  @ApiResponse({ 
    status: 302, 
    description: 'Redirects to /api/v1/health' 
  })
  redirect(@Res() res: Response) {
    return res.redirect(302, '/api/v1/health');
  }

  /**
   * Root HEAD endpoint - Quick health check for monitoring systems
   * Many monitoring tools use HEAD requests for lightweight health checks
   */
  @Head()
  @ApiOperation({ 
    summary: 'Root HEAD check',
    description: 'Lightweight health check endpoint for monitoring systems'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Service is alive and responding' 
  })
  head(@Res() res: Response) {
    return res.status(200).end();
  }
}