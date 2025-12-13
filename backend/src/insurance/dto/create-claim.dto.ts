import { IsString, IsNumber, IsOptional, IsDateString, IsArray } from 'class-validator';

export class CreateClaimDto {
  @IsString()
  insuranceCardId: string;

  @IsString()
  providerId: string;

  @IsString()
  serviceType: string;

  @IsDateString()
  serviceDate: string;

  @IsNumber()
  totalAmount: number;

  @IsOptional()
  @IsString()
  diagnosis?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  procedureCodes?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}