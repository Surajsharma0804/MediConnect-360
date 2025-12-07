import { IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { AccessLevel } from '../../entities/family-member.entity';

export class GrantAccessDto {
  @IsEnum(AccessLevel)
  @IsOptional()
  accessLevel?: AccessLevel;

  @IsBoolean()
  @IsOptional()
  canViewMedicalRecords?: boolean;

  @IsBoolean()
  @IsOptional()
  canBookAppointments?: boolean;

  @IsBoolean()
  @IsOptional()
  canManagePrescriptions?: boolean;
}
