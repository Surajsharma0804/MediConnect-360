import { IsString, IsOptional, IsArray, IsEnum, MaxLength } from 'class-validator';
import { ConversationType } from '../../entities/conversation.entity';

export class CreateConversationDto {
  @IsEnum(ConversationType)
  @IsOptional()
  type?: ConversationType;

  @IsString()
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @IsArray()
  @IsString({ each: true })
  participantIds: string[];

  @IsOptional()
  metadata?: Record<string, any>;
}
