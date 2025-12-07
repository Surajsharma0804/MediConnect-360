import { IsString, IsNotEmpty, IsOptional, IsDate, MaxLength, IsArray, IsEnum, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { LabResultStatus } from '../../entities/lab-result.entity';

class LabResultItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsString()
  @IsNotEmpty()
  unit: string;

  @IsString()
  @IsNotEmpty()
  referenceRange: string;

  @IsBoolean()
  isAbnormal: boolean;

  @IsString()
  @IsOptional()
  flag?: 'high' | 'low' | 'critical';
}

export class CreateLabResultDto {
  @IsString()
  @IsOptional()
  providerId?: string;

  @IsString()
  @IsOptional()
  appointmentId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  testName: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  testCode?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDate()
  @Type(() => Date)
  testDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  resultDate?: Date;

  @IsEnum(LabResultStatus)
  @IsOptional()
  status?: LabResultStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LabResultItemDto)
  results: LabResultItemDto[];

  @IsString()
  @IsOptional()
  @MaxLength(255)
  labName?: string;

  @IsString()
  @IsOptional()
  labAddress?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  orderedBy?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  performedBy?: string;

  @IsString()
  @IsOptional()
  interpretation?: string;

  @IsString()
  @IsOptional()
  recommendations?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  requiresFollowUp?: boolean;
}
