import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
  IsEnum,
  MaxLength,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AllergySeverity, AllergyType } from '../../entities/allergy.entity';

export class CreateAllergyDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  allergen: string;

  @IsEnum(AllergyType)
  type: AllergyType;

  @IsEnum(AllergySeverity)
  severity: AllergySeverity;

  @IsArray()
  @IsOptional()
  reactions?: string[];

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  firstOccurrence?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  lastOccurrence?: Date;

  @IsString()
  @IsOptional()
  treatment?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  diagnosedBy?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
