import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WearableDevice } from '../entities/wearable-device.entity';
import { User } from '../entities/user.entity';
import { WearableService } from './services/wearable.service';
import { WearableController } from './controllers/wearable.controller';
import { NotificationService } from '../services/notification.service';
import { EmailService } from '../services/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([WearableDevice, User])],
  controllers: [WearableController],
  providers: [WearableService, NotificationService, EmailService],
  exports: [WearableService],
})
export class IntegrationsModule {}
