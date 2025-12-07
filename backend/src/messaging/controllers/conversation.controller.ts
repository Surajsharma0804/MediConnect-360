import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ConversationService } from '../services/conversation.service';
import { CreateConversationDto } from '../dto/create-conversation.dto';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  async create(@Request() req, @Body() createDto: CreateConversationDto) {
    return this.conversationService.create(req.user.userId, createDto);
  }

  @Get()
  async findAll(@Request() req) {
    return this.conversationService.findAll(req.user.userId);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const count = await this.conversationService.getUnreadCount(
      req.user.userId,
    );
    return { count };
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.conversationService.findOne(id, req.user.userId);
  }

  @Post(':id/participants')
  async addParticipant(
    @Request() req,
    @Param('id') id: string,
    @Body('participantId') participantId: string,
  ) {
    return this.conversationService.addParticipant(
      id,
      req.user.userId,
      participantId,
    );
  }

  @Delete(':id/participants/:participantId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeParticipant(
    @Request() req,
    @Param('id') id: string,
    @Param('participantId') participantId: string,
  ) {
    await this.conversationService.removeParticipant(
      id,
      req.user.userId,
      participantId,
    );
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAsRead(@Request() req, @Param('id') id: string) {
    await this.conversationService.markAsRead(id, req.user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Request() req, @Param('id') id: string) {
    await this.conversationService.delete(id, req.user.userId);
  }
}
