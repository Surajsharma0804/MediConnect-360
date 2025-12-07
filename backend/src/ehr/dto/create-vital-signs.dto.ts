import {
  IsNumber,
  IsOptional,
  IsDate,
  Min,
  Max,
  MaxLength,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVitalSignsDto {
  @IsNumber()
  @Min(50)
  @Max(250)
  @IsOptional()
  systolicBP?: number;

  @IsNumber()
  @Min(30)
  @Max(150)
  @IsOptional()
  diastolicBP?: number;

  @IsNumber()
  @Min(30)
  @Max(250)
  @IsOptional()
  heartRate?: number;

  @IsNumber()
  @Min(90)
  @Max(110)
  @IsOptional()
  temperature?: number;

  @IsNumber()
  @Min(8)
  @Max(60)
  @IsOptional()
  respiratoryRate?: number;

  @IsNumber()
  @Min(70)
  @Max(100)
  @IsOptional()
  oxygenSaturation?: number;

  @IsNumber()
  @Min(0)
  @Max(1000)
  @IsOptional()
  weight?: number;

  @IsNumber()
  @Min(0)
  @Max(300)
  @IsOptional()
  height?: number;

  @IsNumber()
  @Min(10)
  @Max(100)
  @IsOptional()
  bmi?: number;

  @IsNumber()
  @Min(20)
  @Max(600)
  @IsOptional()
  bloodGlucose?: number;

  @IsNumber()
  @Min(0)
  @Max(10)
  @IsOptional()
  painLevel?: number;

  @IsNumber()
  @Min(0)
  @Max(500)
  @IsOptional()
  totalCholesterol?: number;

  @IsNumber()
  @Min(0)
  @Max(300)
  @IsOptional()
  ldlCholesterol?: number;

  @IsNumber()
  @Min(0)
  @Max(200)
  @IsOptional()
  hdlCholesterol?: number;

  @IsNumber()
  @Min(0)
  @Max(1000)
  @IsOptional()
  triglycerides?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  recordedAt?: Date;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;
}
