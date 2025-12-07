import { IsNumber, IsString, IsOptional, Min, Max, MaxLength } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  communicationRating?: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  professionalismRating?: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  knowledgeRating?: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  waitTimeRating?: number;

  @IsString()
  @MaxLength(2000)
  @IsOptional()
  comment?: string;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  visitReason?: string;
}
