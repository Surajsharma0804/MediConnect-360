import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  MinLength,
  MaxLength,
} from 'class-validator';

export class SymptomCheckDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(1000)
  symptoms: string;

  @IsOptional()
  @IsString()
  language?: string;
}

export class ChatDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(1000)
  message: string;

  @IsOptional()
  @IsString()
  language?: string;
}

export class DrugInteractionDto {
  @IsArray()
  @IsNotEmpty()
  @IsString({ each: true })
  medications: string[];
}
