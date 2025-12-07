import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async healthCheck() {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'MediConnect 360 API',
      version: '1.0.0',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: 'not_checked',
        ai: 'not_checked',
        email: 'not_checked',
      },
    };

    // Check if critical services are configured
    try {
      // Database check
      health.checks.database = process.env.DATABASE_URL ? 'configured' : 'not_configured';

      // AI service check
      health.checks.ai = process.env.GEMINI_API_KEY ? 'configured' : 'not_configured';

      // Email service check
      health.checks.email = process.env.RESEND_API_KEY ? 'configured' : 'not_configured';
    } catch (error) {
      health.status = 'degraded';
    }

    return health;
  }
}
