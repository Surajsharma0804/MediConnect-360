import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('app') // Add 'app' prefix to avoid conflict with RootController
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): object {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'MediConnect 360 Backend',
      version: '1.0.0',
    };
  }
}