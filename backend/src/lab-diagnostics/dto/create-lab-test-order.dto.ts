import { IsEnum, IsString, IsOptional, IsBoolean, IsNumber, IsDateString, IsObject } from 'class-validator';
import { LabTestType, LabTestPriority } from '../../entities/lab-test-order.entity';

export class CreateLabTestOrderDto {
  @IsEnum(LabTestType)
  testType: LabTestType;

  @IsString()
  testName: string;

  @IsOptional()
  @IsString()
  testDescription?: string;

  @IsOptional()
  @IsString()
  orderedByProviderId?: string;

  @IsOptional()
  @IsObject()
  testCodes?: {
    loinc?: string;
    cpt?: string;
    icd10?: string[];
  };

  @IsOptional()
  @IsEnum(LabTestPriority)
  priority?: LabTestPriority;

  @IsOptional()
  @IsBoolean()
  isHomeKit?: boolean;

  @IsOptional()
  @IsString()
  labFacilityName?: string;

  @IsOptional()
  @IsString()
  labFacilityAddress?: string;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsOptional()
  @IsString()
  preparationNotes?: string;

  @IsOptional()
  @IsNumber()
  estimatedCost?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsBoolean()
  insuranceCovered?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
