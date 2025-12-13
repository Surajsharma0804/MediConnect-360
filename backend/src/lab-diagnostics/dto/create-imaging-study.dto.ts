import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateImagingStudyDto {
  @IsString()
  studyType: string;

  @IsString()
  bodyPart: string;

  @IsOptional()
  @IsString()
  indication?: string;

  @IsOptional()
  @IsString()
  urgency?: string;

  @IsOptional()
  @IsDateString()
  requestedDate?: string;

  @IsOptional()
  @IsString()
  orderingPhysician?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}