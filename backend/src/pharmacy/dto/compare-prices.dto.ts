import { IsString, IsNotEmpty, IsInt, IsOptional, Min } from 'class-validator';

export class ComparePricesDto {
  @IsString()
  @IsNotEmpty()
  drugName: string;

  @IsString()
  @IsNotEmpty()
  dosage: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  @IsOptional()
  zipCode?: string;
}
