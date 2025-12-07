import { IsString, MinLength, MaxLength, IsOptional, IsIn } from 'class-validator';

export class SymptomCheckDto {
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  symptoms: string;

  @IsOptional()
  @IsString()
  @IsIn(['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi'])
  language?: string;
}

export class ChatDto {
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  message: string;

  @IsOptional()
  @IsString()
  @IsIn(['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi'])
  language?: string;
}

export class DrugInteractionDto {
  @IsString({ each: true })
  @MinLength(2, { each: true })
  @MaxLength(100, { each: true })
  medications: string[];
}
