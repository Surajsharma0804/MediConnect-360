import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthTracking } from '../entities/health-tracking.entity';
import { HealthTrackingService } from './services/health-tracking.service';
import { HealthTrackingController } from './controllers/health-tracking.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HealthTracking])],
  controllers: [HealthTrackingController],
  providers: [HealthTrackingService],
  exports: [HealthTrackingService],
})
export class HealthTrackingModule {}
