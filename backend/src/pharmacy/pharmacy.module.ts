import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pharmacy } from '../entities/pharmacy.entity';
import { EPrescription } from '../entities/e-prescription.entity';
import { DrugPrice } from '../entities/drug-price.entity';
import { Prescription } from '../entities/prescription.entity';
import { User } from '../entities/user.entity';
import { PharmacyService } from './services/pharmacy.service';
import { EPrescriptionService } from './services/e-prescription.service';
import { DrugPriceService } from './services/drug-price.service';
import { PharmacyController } from './controllers/pharmacy.controller';
import { EPrescriptionController } from './controllers/e-prescription.controller';
import { DrugPriceController } from './controllers/drug-price.controller';
import { EmailService } from '../services/email.service';
import { NotificationService } from '../services/notification.service';
import { SMSService } from '../services/sms.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Pharmacy,
      EPrescription,
      DrugPrice,
      Prescription,
      User,
    ]),
  ],
  controllers: [
    PharmacyController,
    EPrescriptionController,
    DrugPriceController,
  ],
  providers: [
    PharmacyService,
    EPrescriptionService,
    DrugPriceService,
    EmailService,
    NotificationService,
    SMSService,
  ],
  exports: [PharmacyService, EPrescriptionService, DrugPriceService],
})
export class PharmacyModule {}
