import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
  IsEnum,
  IsNumber,
  Min,
  MaxLength,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  PrescriptionStatus,
  PrescriptionFrequency,
} from '../../entities/prescription.entity';

export class CreatePrescriptionDto {
  @IsString()
  @IsOptional()
  providerId?: string;

  @IsString()
  @IsOptional()
  appointmentId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  medicationName: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  genericName?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  dosage: string;

  @IsEnum(PrescriptionFrequency)
  frequency: PrescriptionFrequency;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  refillsRemaining?: number;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsString()
  @IsOptional()
  sideEffects?: string;

  @IsString()
  @IsOptional()
  warnings?: string;

  @IsEnum(PrescriptionStatus)
  @IsOptional()
  status?: PrescriptionStatus;

  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  endDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  lastRefillDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  nextRefillDate?: Date;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  pharmacyName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  pharmacyPhone?: string;

  @IsString()
  @IsOptional()
  pharmacyAddress?: string;

  @IsBoolean()
  @IsOptional()
  isControlledSubstance?: boolean;

  @IsBoolean()
  @IsOptional()
  reminderEnabled?: boolean;

  @IsArray()
  @IsOptional()
  reminderTimes?: string[];
}
