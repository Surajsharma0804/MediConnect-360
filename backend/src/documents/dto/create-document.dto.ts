import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { DocumentType } from '../../entities/medical-document.entity';

export class CreateDocumentDto {
  @IsString()
  title: string;

  @IsEnum(DocumentType)
  type: DocumentType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}