import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { MessageService } from '../services/message.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  async create(@Request() req, @Body() createDto: CreateMessageDto) {
    return this.messageService.create(req.user.userId, createDto);
  }

  @Get('conversation/:conversationId')
  async findByConversation(
    @Request() req,
    @Param('conversationId') conversationId: string,
    @Query('limit') limit?: number,
    @Query('before') before?: string,
  ) {
    return this.messageService.findByConversation(
      conversationId,
      req.user.userId,
      limit ? parseInt(limit.toString()) : 50,
      before,
    );
  }

  @Get('search')
  async search(
    @Request() req,
    @Query('q') query: string,
    @Query('conversationId') conversationId?: string,
  ) {
    return this.messageService.search(req.user.userId, query, conversationId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.messageService.findOne(id, req.user.userId);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateMessageDto,
  ) {
    return this.messageService.update(id, req.user.userId, updateDto.content);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Request() req, @Param('id') id: string) {
    await this.messageService.delete(id, req.user.userId);
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAsRead(@Request() req, @Param('id') id: string) {
    await this.messageService.markAsRead(id, req.user.userId);
  }

  @Post('conversation/:conversationId/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markConversationAsRead(
    @Request() req,
    @Param('conversationId') conversationId: string,
  ) {
    await this.messageService.markConversationAsRead(
      conversationId,
      req.user.userId,
    );
  }
}
