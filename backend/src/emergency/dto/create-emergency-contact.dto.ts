import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsBoolean,
  IsOptional,
  IsNumber,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ContactRelationship } from '../../entities/emergency-contact.entity';

export class CreateEmergencyContactDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @IsEnum(ContactRelationship)
  relationship: ContactRelationship;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  primaryPhone: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  secondaryPhone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @IsNumber()
  @IsOptional()
  priority?: number;

  @IsBoolean()
  @IsOptional()
  canMakeMedicalDecisions?: boolean;

  @IsBoolean()
  @IsOptional()
  notifyOnEmergency?: boolean;

  @IsBoolean()
  @IsOptional()
  hasHealthcarePowerOfAttorney?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
