import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Conversation,
  ConversationType,
} from '../../entities/conversation.entity';

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
  ) {}

  async create(userId: string, data: any): Promise<Conversation> {
    try {
      const conversation = this.conversationRepository.create({
        type: data.type || ConversationType.DIRECT,
        name: data.name,
        participants: [userId, ...(data.participantIds || [])],
        createdBy: userId,
        metadata: data.metadata,
      });

      const saved = await this.conversationRepository.save(conversation);
      this.logger.log(`Created conversation ${saved.id}`);
      return saved;
    } catch (error) {
      this.logger.error(`Error creating conversation: ${error.message}`);
      throw new Error('Failed to create conversation');
    }
  }

  async findAll(userId: string): Promise<Conversation[]> {
    try {
      return await this.conversationRepository
        .createQueryBuilder('conversation')
        .where(':userId = ANY(conversation.participants)', { userId })
        .orderBy('conversation.lastMessageAt', 'DESC')
        .getMany();
    } catch (error) {
      this.logger.error(`Error fetching conversations: ${error.message}`);
      throw new Error('Failed to fetch conversations');
    }
  }

  async findOne(id: string, userId: string): Promise<Conversation> {
    try {
      const conversation = await this.conversationRepository.findOne({
        where: { id },
      });

      if (!conversation) {
        throw new NotFoundException('Conversation not found');
      }

      // Check if user is participant
      if (!conversation.participants.includes(userId)) {
        throw new ForbiddenException(
          'You are not a participant in this conversation',
        );
      }

      return conversation;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error(`Error fetching conversation: ${error.message}`);
      throw new Error('Failed to fetch conversation');
    }
  }

  async addParticipant(
    conversationId: string,
    userId: string,
    newParticipantId: string,
  ): Promise<Conversation> {
    try {
      const conversation = await this.findOne(conversationId, userId);

      if (!conversation.participants.includes(newParticipantId)) {
        conversation.participants.push(newParticipantId);
        const updated = await this.conversationRepository.save(conversation);
        this.logger.log(
          `Added participant ${newParticipantId} to conversation ${conversationId}`,
        );
        return updated;
      }

      return conversation;
    } catch (error) {
      this.logger.error(`Error adding participant: ${error.message}`);
      throw error;
    }
  }

  async removeParticipant(
    conversationId: string,
    userId: string,
    participantId: string,
  ): Promise<Conversation> {
    try {
      const conversation = await this.findOne(conversationId, userId);

      conversation.participants = conversation.participants.filter(
        (id) => id !== participantId,
      );
      const updated = await this.conversationRepository.save(conversation);
      this.logger.log(
        `Removed participant ${participantId} from conversation ${conversationId}`,
      );
      return updated;
    } catch (error) {
      this.logger.error(`Error removing participant: ${error.message}`);
      throw error;
    }
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const conversation = await this.findOne(conversationId, userId);

      if (!conversation.unreadCount) {
        conversation.unreadCount = {};
      }

      conversation.unreadCount[userId] = 0;
      await this.conversationRepository.save(conversation);
      this.logger.log(
        `Marked conversation ${conversationId} as read by ${userId}`,
      );
    } catch (error) {
      this.logger.error(`Error marking as read: ${error.message}`);
      throw error;
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const conversations = await this.findAll(userId);

      let unreadCount = 0;
      for (const conv of conversations) {
        const count = conv.unreadCount?.[userId] || 0;
        unreadCount += count;
      }

      return unreadCount;
    } catch (error) {
      this.logger.error(`Error getting unread count: ${error.message}`);
      return 0;
    }
  }

  async updateLastMessage(
    conversationId: string,
    messageContent: string,
  ): Promise<void> {
    try {
      await this.conversationRepository.update(conversationId, {
        lastMessageContent: messageContent,
        lastMessageAt: new Date(),
      });
    } catch (error) {
      this.logger.error(`Error updating last message: ${error.message}`);
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      const conversation = await this.findOne(id, userId);

      // Only creator can delete
      if (conversation.createdBy !== userId) {
        throw new ForbiddenException(
          'Only the creator can delete this conversation',
        );
      }

      await this.conversationRepository.delete(id);
      this.logger.log(`Deleted conversation ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting conversation: ${error.message}`);
      throw error;
    }
  }
}
