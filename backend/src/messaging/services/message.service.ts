import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Message,
  MessageType,
  MessageStatus,
} from '../../entities/message.entity';
import { ConversationService } from './conversation.service';
import { NotificationService } from '../../services/notification.service';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly conversationService: ConversationService,
    private readonly notificationService: NotificationService,
  ) {}

  async create(userId: string, data: any): Promise<Message> {
    try {
      // Verify user is participant in conversation
      await this.conversationService.findOne(data.conversationId, userId);

      const message = this.messageRepository.create({
        conversationId: data.conversationId,
        senderId: userId,
        content: data.content,
        type: data.type || MessageType.TEXT,
        attachments: data.attachments,
        metadata: data.metadata,
      });

      const saved = await this.messageRepository.save(message);

      // Update conversation's last message
      await this.conversationService.updateLastMessage(
        data.conversationId,
        data.content.substring(0, 100),
      );

      // Send notifications to other participants
      const conversation = await this.conversationService.findOne(
        data.conversationId,
        userId,
      );
      const otherParticipants = conversation.participants.filter(
        (id) => id !== userId,
      );

      for (const participantId of otherParticipants) {
        await this.notificationService.sendPushNotification(participantId, {
          title: 'New Message',
          body: data.content.substring(0, 100),
          icon: '/icons/message.png',
          data: {
            type: 'new_message',
            conversationId: data.conversationId,
            messageId: saved.id,
          },
        });
      }

      this.logger.log(
        `Created message ${saved.id} in conversation ${data.conversationId}`,
      );
      return saved;
    } catch (error) {
      this.logger.error(`Error creating message: ${error.message}`);
      throw error;
    }
  }

  async findByConversation(
    conversationId: string,
    userId: string,
    limit: number = 50,
    before?: string,
  ): Promise<Message[]> {
    try {
      // Verify user is participant
      await this.conversationService.findOne(conversationId, userId);

      const query = this.messageRepository
        .createQueryBuilder('message')
        .where('message.conversationId = :conversationId', { conversationId })
        .orderBy('message.createdAt', 'DESC')
        .take(limit);

      if (before) {
        query.andWhere('message.createdAt < :before', {
          before: new Date(before),
        });
      }

      const messages = await query.getMany();
      return messages.reverse(); // Return in chronological order
    } catch (error) {
      this.logger.error(`Error fetching messages: ${error.message}`);
      throw error;
    }
  }

  async findOne(id: string, userId: string): Promise<Message> {
    try {
      const message = await this.messageRepository.findOne({
        where: { id },
      });

      if (!message) {
        throw new NotFoundException('Message not found');
      }

      // Verify user is participant in conversation
      await this.conversationService.findOne(message.conversationId, userId);

      return message;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error(`Error fetching message: ${error.message}`);
      throw new Error('Failed to fetch message');
    }
  }

  async update(id: string, userId: string, content: string): Promise<Message> {
    try {
      const message = await this.findOne(id, userId);

      // Only sender can edit
      if (message.senderId !== userId) {
        throw new ForbiddenException('You can only edit your own messages');
      }

      message.content = content;
      message.isEdited = true;
      message.editedAt = new Date();

      const updated = await this.messageRepository.save(message);
      this.logger.log(`Updated message ${id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Error updating message: ${error.message}`);
      throw error;
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      const message = await this.findOne(id, userId);

      // Only sender can delete
      if (message.senderId !== userId) {
        throw new ForbiddenException('You can only delete your own messages');
      }

      message.deletedAt = new Date();
      message.content = '[Message deleted]';

      await this.messageRepository.save(message);
      this.logger.log(`Deleted message ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting message: ${error.message}`);
      throw error;
    }
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    try {
      const message = await this.findOne(id, userId);

      if (message.senderId !== userId) {
        message.readAt = new Date();
        message.status = MessageStatus.READ;
        await this.messageRepository.save(message);
        this.logger.log(`Marked message ${id} as read by ${userId}`);
      }
    } catch (error) {
      this.logger.error(`Error marking message as read: ${error.message}`);
      throw error;
    }
  }

  async markConversationAsRead(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    try {
      // Verify user is participant
      await this.conversationService.findOne(conversationId, userId);

      const messages = await this.messageRepository.find({
        where: { conversationId },
      });

      for (const message of messages) {
        if (message.senderId !== userId && !message.readAt) {
          message.readAt = new Date();
          message.status = MessageStatus.READ;
        }
      }

      await this.messageRepository.save(messages);
      await this.conversationService.markAsRead(conversationId, userId);
      this.logger.log(
        `Marked all messages in conversation ${conversationId} as read`,
      );
    } catch (error) {
      this.logger.error(`Error marking conversation as read: ${error.message}`);
      throw error;
    }
  }

  async search(
    userId: string,
    query: string,
    conversationId?: string,
  ): Promise<Message[]> {
    try {
      const queryBuilder = this.messageRepository
        .createQueryBuilder('message')
        .where('message.content ILIKE :query', { query: `%${query}%` })
        .andWhere('message.deletedAt IS NULL')
        .orderBy('message.createdAt', 'DESC')
        .take(50);

      if (conversationId) {
        queryBuilder.andWhere('message.conversationId = :conversationId', {
          conversationId,
        });
        // Verify user is participant
        await this.conversationService.findOne(conversationId, userId);
      }

      return await queryBuilder.getMany();
    } catch (error) {
      this.logger.error(`Error searching messages: ${error.message}`);
      throw new Error('Failed to search messages');
    }
  }
}
