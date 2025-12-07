import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDate,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateImmunizationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  vaccineName: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  cvxCode?: string;

  @IsDate()
  @Type(() => Date)
  administeredDate: Date;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  administeredBy?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  facility?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  lotNumber?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  manufacturer?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expirationDate?: Date;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  route?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  site?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  doseNumber?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  nextDoseDate?: Date;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;
}
