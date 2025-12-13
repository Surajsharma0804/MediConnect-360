import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'MediConnect 360 Backend API - Production Ready!';
  }
}