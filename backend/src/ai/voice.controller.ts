import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AIService } from '../services/ai.service';
import { VoiceService } from '../services/voice.service';
import '../types/multer';

@Controller('ai/voice')
export class VoiceController {
  constructor(
    private readonly aiService: AIService,
    private readonly voiceService: VoiceService,
  ) {}

  @Post('symptom-check')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('audio'))
  async voiceSymptomCheck(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: string,
    @Query('language') language: string = 'en-US',
  ) {
    if (!file) {
      throw new BadRequestException('Audio file is required');
    }

    try {
      // Convert audio to text
      const transcript = await this.voiceService.speechToText(
        file.buffer,
        language,
      );

      // Process symptoms with AI
      const analysis = await this.aiService.analyzeSymptoms(transcript);

      return {
        transcript,
        analysis,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new BadRequestException(
        `Voice processing failed: ${error.message}`,
      );
    }
  }

  @Post('chat')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('audio'))
  async voiceChat(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId: string,
    @Query('language') language: string = 'en-US',
    @Body('conversationHistory') _conversationHistory?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Audio file is required');
    }

    try {
      // Convert audio to text
      const transcript = await this.voiceService.speechToText(
        file.buffer,
        language,
      );

      // Process with AI chat
      const response = await this.aiService.chatWithAI(transcript, userId);

      // Convert response back to speech
      const audioResponse = await this.voiceService.textToSpeech(
        response.message,
        language,
      );

      return {
        transcript,
        response: response.message,
        audioResponse: audioResponse.toString('base64'),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new BadRequestException(`Voice chat failed: ${error.message}`);
    }
  }

  @Get('supported-languages')
  getSupportedLanguages() {
    return this.voiceService.getSupportedLanguages();
  }
}