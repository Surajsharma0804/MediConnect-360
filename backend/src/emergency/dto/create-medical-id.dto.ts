import {
  IsString,
  IsArray,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsDate,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMedicalIDDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @IsDate()
  @Type(() => Date)
  dateOfBirth: Date;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  bloodType: string;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  heightUnit?: string;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  weightUnit?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  medicalConditions?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allergies?: string[];

  @IsArray()
  @IsOptional()
  currentMedications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;

  @IsArray()
  @IsOptional()
  emergencyContacts?: Array<{
    name: string;
    relationship: string;
    phone: string;
  }>;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  primaryPhysician?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  physicianPhone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  preferredHospital?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  insuranceProvider?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  insurancePolicyNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  insuranceGroupNumber?: string;

  @IsBoolean()
  @IsOptional()
  isOrganDonor?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  specialInstructions?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  advanceDirectives?: string;

  @IsBoolean()
  @IsOptional()
  hasPacemaker?: boolean;

  @IsBoolean()
  @IsOptional()
  hasImplants?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  implantDetails?: string;

  @IsBoolean()
  @IsOptional()
  isVisibleToEmergencyServices?: boolean;

  @IsBoolean()
  @IsOptional()
  requiresInterpreter?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  preferredLanguage?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
