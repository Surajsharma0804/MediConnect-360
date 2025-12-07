import { IsString, IsOptional, IsEnum } from 'class-validator';

export class TriggerSOSDto {
  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsEnum(['low', 'medium', 'high', 'critical'])
  @IsOptional()
  severity?: string;
}
