import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmergencyContact } from '../entities/emergency-contact.entity';
import { MedicalID } from '../entities/medical-id.entity';
import { EmergencyContactService } from './services/emergency-contact.service';
import { MedicalIDService } from './services/medical-id.service';
import { SOSService } from './services/sos.service';
import { EmergencyContactController } from './controllers/emergency-contact.controller';
import { MedicalIDController } from './controllers/medical-id.controller';
import { SOSController } from './controllers/sos.controller';
import { NotificationService } from '../services/notification.service';
import { EmailService } from '../services/email.service';
import { SMSService } from '../services/sms.service';

@Module({
  imports: [TypeOrmModule.forFeature([EmergencyContact, MedicalID])],
  controllers: [EmergencyContactController, MedicalIDController, SOSController],
  providers: [
    EmergencyContactService,
    MedicalIDService,
    SOSService,
    NotificationService,
    EmailService,
    SMSService,
  ],
  exports: [EmergencyContactService, MedicalIDService, SOSService],
})
export class EmergencyModule {}
