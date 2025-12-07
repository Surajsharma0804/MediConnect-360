import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { DeliveryMethod } from '../../entities/e-prescription.entity';

export class SendPrescriptionDto {
  @IsUUID()
  @IsNotEmpty()
  prescriptionId: string;

  @IsUUID()
  @IsNotEmpty()
  pharmacyId: string;

  @IsEnum(DeliveryMethod)
  @IsNotEmpty()
  deliveryMethod: DeliveryMethod;

  @IsString()
  @IsOptional()
  deliveryAddress?: string;

  @IsString()
  @IsOptional()
  deliveryInstructions?: string;
}
