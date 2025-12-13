import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateInsuranceCardDto {
  @IsString()
  insuranceProvider: string;

  @IsString()
  policyNumber: string;

  @IsString()
  groupNumber: string;

  @IsString()
  memberName: string;

  @IsString()
  memberId: string;

  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @IsOptional()
  @IsString()
  planType?: string;

  @IsOptional()
  @IsString()
  copayAmount?: string;

  @IsOptional()
  @IsString()
  deductibleAmount?: string;
}