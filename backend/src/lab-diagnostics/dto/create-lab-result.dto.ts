import { IsString, IsOptional, IsBoolean, IsDateString, IsEnum, IsArray, IsObject } from 'class-validator';
import { ResultStatus } from '../../entities/lab-test-result-detail.entity';

export class CreateLabResultDto {
  @IsOptional()
  @IsString()
  labTestOrderId?: string;

  @IsString()
  testName: string;

  @IsString()
  componentName: string;

  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  referenceRange?: string;

  @IsOptional()
  @IsEnum(ResultStatus)
  status?: ResultStatus;

  @IsOptional()
  @IsBoolean()
  isAbnormal?: boolean;

  @IsOptional()
  @IsBoolean()
  isCritical?: boolean;

  @IsOptional()
  @IsString()
  interpretation?: string;

  @IsOptional()
  @IsString()
  loincCode?: string;

  @IsOptional()
  @IsDateString()
  resultDate?: string;

  @IsOptional()
  @IsString()
  labName?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
