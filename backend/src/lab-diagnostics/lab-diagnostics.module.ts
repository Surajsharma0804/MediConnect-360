import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabTestOrder } from '../entities/lab-test-order.entity';
import { ImagingStudy } from '../entities/imaging-study.entity';
import { LabTestResultDetail } from '../entities/lab-test-result-detail.entity';
import { User } from '../entities/user.entity';
import { Provider } from '../entities/provider.entity';
import { LabTestOrderService } from './services/lab-test-order.service';
import { ImagingService } from './services/imaging.service';
import { LabResultService } from './services/lab-result.service';
import { LabTestOrderController } from './controllers/lab-test-order.controller';
import { ImagingController } from './controllers/imaging.controller';
import { LabResultController } from './controllers/lab-result.controller';
import { AIService } from '../services/ai.service';
import { NotificationService } from '../services/notification.service';
import { StorageService } from '../services/storage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LabTestOrder,
      ImagingStudy,
      LabTestResultDetail,
      User,
      Provider,
    ]),
  ],
  controllers: [LabTestOrderController, ImagingController, LabResultController],
  providers: [
    LabTestOrderService,
    ImagingService,
    LabResultService,
    AIService,
    NotificationService,
    StorageService,
  ],
  exports: [LabTestOrderService, ImagingService, LabResultService],
})
export class LabDiagnosticsModule {}
