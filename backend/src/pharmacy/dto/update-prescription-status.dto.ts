import { IsEnum, IsOptional, IsNumber, IsString } from 'class-validator';
import { EPrescriptionStatus } from '../../entities/e-prescription.entity';

export class UpdatePrescriptionStatusDto {
  @IsEnum(EPrescriptionStatus)
  status: EPrescriptionStatus;

  @IsNumber()
  @IsOptional()
  finalCost?: number;

  @IsNumber()
  @IsOptional()
  insuranceCoverage?: number;

  @IsNumber()
  @IsOptional()
  copay?: number;

  @IsString()
  @IsOptional()
  trackingNumber?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
