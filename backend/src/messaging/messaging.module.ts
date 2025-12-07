import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from '../entities/message.entity';
import { Conversation } from '../entities/conversation.entity';
import { MessageService } from './services/message.service';
import { ConversationService } from './services/conversation.service';
import { MessageController } from './controllers/message.controller';
import { ConversationController } from './controllers/conversation.controller';
import { NotificationService } from '../services/notification.service';
import { EmailService } from '../services/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Conversation])],
  controllers: [MessageController, ConversationController],
  providers: [MessageService, ConversationService, NotificationService, EmailService],
  exports: [MessageService, ConversationService],
})
export class MessagingModule {}
