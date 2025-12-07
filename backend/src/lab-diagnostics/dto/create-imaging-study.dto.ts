import { IsEnum, IsString, IsOptional, IsDateString, IsArray, IsObject, IsNumber } from 'class-validator';
import { ImagingModality } from '../../entities/imaging-study.entity';

export class CreateImagingStudyDto {
  @IsEnum(ImagingModality)
  modality: ImagingModality;

  @IsString()
  studyDescription: string;

  @IsOptional()
  @IsString()
  bodyPart?: string;

  @IsOptional()
  @IsString()
  clinicalIndication?: string;

  @IsOptional()
  @IsString()
  orderedByProviderId?: string;

  @IsOptional()
  @IsString()
  imagingCenterName?: string;

  @IsOptional()
  @IsString()
  imagingCenterAddress?: string;

  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsNumber()
  cost?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
