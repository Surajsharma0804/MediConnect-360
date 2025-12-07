import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicalHistory } from '../entities/medical-history.entity';
import { Prescription } from '../entities/prescription.entity';
import { LabResult } from '../entities/lab-result.entity';
import { VitalSigns } from '../entities/vital-signs.entity';
import { Allergy } from '../entities/allergy.entity';
import { Immunization } from '../entities/immunization.entity';
import { MedicalHistoryController } from './controllers/medical-history.controller';
import { PrescriptionController } from './controllers/prescription.controller';
import { LabResultController } from './controllers/lab-result.controller';
import { VitalSignsController } from './controllers/vital-signs.controller';
import { AllergyController } from './controllers/allergy.controller';
import { ImmunizationController } from './controllers/immunization.controller';
import { MedicalHistoryService } from './services/medical-history.service';
import { PrescriptionService } from './services/prescription.service';
import { LabResultService } from './services/lab-result.service';
import { VitalSignsService } from './services/vital-signs.service';
import { AllergyService } from './services/allergy.service';
import { ImmunizationService } from './services/immunization.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MedicalHistory,
      Prescription,
      LabResult,
      VitalSigns,
      Allergy,
      Immunization,
    ]),
  ],
  controllers: [
    MedicalHistoryController,
    PrescriptionController,
    LabResultController,
    VitalSignsController,
    AllergyController,
    ImmunizationController,
  ],
  providers: [
    MedicalHistoryService,
    PrescriptionService,
    LabResultService,
    VitalSignsService,
    AllergyService,
    ImmunizationService,
  ],
  exports: [
    MedicalHistoryService,
    PrescriptionService,
    LabResultService,
    VitalSignsService,
    AllergyService,
    ImmunizationService,
  ],
})
export class EHRModule {}
