import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class SearchPharmacyDto {
  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  zipCode?: string;

  @IsString()
  @IsOptional()
  chain?: string;

  @IsBoolean()
  @IsOptional()
  isOpen24Hours?: boolean;

  @IsBoolean()
  @IsOptional()
  offersDelivery?: boolean;

  @IsBoolean()
  @IsOptional()
  acceptsEPrescriptions?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsNumber()
  @IsOptional()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  radiusMiles?: number;
}
