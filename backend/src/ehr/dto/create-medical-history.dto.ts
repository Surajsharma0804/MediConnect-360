import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
  IsEnum,
  IsBoolean,
  MaxLength,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ConditionSeverity,
  ConditionStatus,
} from '../../entities/medical-history.entity';

export class CreateMedicalHistoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  conditionName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ConditionSeverity)
  @IsOptional()
  severity?: ConditionSeverity;

  @IsEnum(ConditionStatus)
  @IsOptional()
  status?: ConditionStatus;

  @IsDate()
  @Type(() => Date)
  diagnosisDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  resolvedDate?: Date;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  diagnosedBy?: string;

  @IsString()
  @IsOptional()
  treatment?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsOptional()
  symptoms?: string[];

  @IsArray()
  @IsOptional()
  medications?: string[];

  @IsBoolean()
  @IsOptional()
  isFamilyHistory?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  familyRelation?: string;
}
