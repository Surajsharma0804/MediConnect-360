import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsOptional,
  IsNumber,
  Min,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AppointmentType } from '../../entities/appointment.entity';

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @IsDate()
  @Type(() => Date)
  scheduledAt: Date;

  @IsNumber()
  @Min(15)
  @IsOptional()
  durationMinutes?: number; // minutes, default 30

  @IsEnum(AppointmentType)
  @IsOptional()
  type?: AppointmentType;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  reason?: string;

  @IsString()
  @MaxLength(2000)
  @IsOptional()
  notes?: string;
}
