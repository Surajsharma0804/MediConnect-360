import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDate, IsBoolean, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { InsuranceType } from '../../entities/insurance-card.entity';

export class CreateInsuranceCardDto {
  @IsEnum(InsuranceType)
  type: InsuranceType;

  @IsString()
  @IsNotEmpty()
  insuranceProvider: string;

  @IsString()
  @IsNotEmpty()
  planName: string;

  @IsString()
  @IsNotEmpty()
  memberId: string;

  @IsString()
  @IsOptional()
  groupNumber?: string;

  @IsString()
  @IsOptional()
  policyNumber?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  effectiveDate?: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expirationDate?: Date;

  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;

  @IsNumber()
  @IsOptional()
  copayPrimaryCare?: number;

  @IsNumber()
  @IsOptional()
  copaySpecialist?: number;

  @IsNumber()
  @IsOptional()
  deductible?: number;

  @IsNumber()
  @IsOptional()
  outOfPocketMax?: number;
}
