import { IsString, IsNotEmpty, IsOptional, IsEnum, MaxLength, IsArray } from 'class-validator';
import { MessageType } from '../../entities/message.entity';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty()
  conversationId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  content: string;

  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType;

  @IsArray()
  @IsOptional()
  attachments?: string[];

  @IsOptional()
  metadata?: Record<string, any>;
}
