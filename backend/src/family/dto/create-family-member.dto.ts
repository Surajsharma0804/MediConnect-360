import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsOptional,
  IsEnum,
  IsBoolean,
  MaxLength,
  IsEmail,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Relationship, AccessLevel } from '../../entities/family-member.entity';

export class CreateFamilyMemberDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @IsEnum(Relationship)
  relationship: Relationship;

  @IsDate()
  @Type(() => Date)
  dateOfBirth: Date;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  gender: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

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

  @IsBoolean()
  @IsOptional()
  isEmergencyContact?: boolean;

  @IsUrl()
  @IsOptional()
  profileImage?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
