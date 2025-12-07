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

@Controller('ai/voice')
export class VoiceController {
  constructor(
    private readonly aiService: AIService,
    private readonly voiceService: VoiceService,
  ) {}

  @Get('languages')
  getSupportedLanguages() {
    return {
      languages: this.voiceService.getSupportedLanguages(),
      message: 'Voice chat supported in 20+ languages',
    };
  }

  @Post('symptom-check')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('audio'))
  async voiceSymptomCheck(
    @UploadedFile() file: Express.Multer.File,
    @Query('language') language: string = 'en-US',
  ) {
    try {
      if (!file) {
        throw new BadRequestException('Audio file is required');
      }

      // Transcribe audio to text
      const transcribedText = await this.voiceService.transcribeAudio(
        file.buffer,
        language,
      );

      // Get AI symptom analysis
      const analysis = await this.aiService.analyzeSymptoms(transcribedText);

      // Convert response to speech
      const audioResponse = await this.voiceService.synthesizeSpeech(
        analysis,
        language,
      );

      return {
        transcription: transcribedText,
        analysis,
        audioResponse: audioResponse.toString('base64'),
        language,
        disclaimer: 'This is NOT medical advice. Always consult a healthcare professional.',
      };
    } catch (error) {
      throw new BadRequestException(`Voice symptom check failed: ${error.message}`);
    }
  }

  @Post('chat')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('audio'))
  async voiceChat(
    @UploadedFile() file: Express.Multer.File,
    @Query('language') language: string = 'en-US',
    @Body('conversationHistory') conversationHistory?: string,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('Audio file is required');
      }

      // Transcribe audio to text
      const transcribedText = await this.voiceService.transcribeAudio(
        file.buffer,
        language,
      );

      // Get AI response (using symptom analysis as chat for now)
      const aiResponse = await this.aiService.analyzeSymptoms(transcribedText);

      // Convert response to speech
      const audioResponse = await this.voiceService.synthesizeSpeech(
        aiResponse,
        language,
      );

      return {
        transcription: transcribedText,
        response: aiResponse,
        audioResponse: audioResponse.toString('base64'),
        language,
        disclaimer: 'This is NOT medical advice. Always consult a healthcare professional.',
      };
    } catch (error) {
      throw new BadRequestException(`Voice chat failed: ${error.message}`);
    }
  }

  @Post('translate')
  @UseGuards(JwtAuthGuard)
  async translateText(
    @Body('text') text: string,
    @Body('targetLanguage') targetLanguage: string,
    @Body('sourceLanguage') sourceLanguage?: string,
  ) {
    try {
      if (!text || !targetLanguage) {
        throw new BadRequestException('Text and target language are required');
      }

      const translation = await this.voiceService.translateText(
        text,
        targetLanguage,
        sourceLanguage,
      );

      return {
        originalText: text,
        translatedText: translation,
        sourceLanguage: sourceLanguage || 'auto-detected',
        targetLanguage,
      };
    } catch (error) {
      throw new BadRequestException(`Translation failed: ${error.message}`);
    }
  }

  @Post('text-to-speech')
  @UseGuards(JwtAuthGuard)
  async textToSpeech(
    @Body('text') text: string,
    @Body('language') language: string = 'en-US',
  ) {
    try {
      if (!text) {
        throw new BadRequestException('Text is required');
      }

      const audioBuffer = await this.voiceService.synthesizeSpeech(text, language);

      return {
        text,
        language,
        audio: audioBuffer.toString('base64'),
        format: 'mp3',
      };
    } catch (error) {
      throw new BadRequestException(`Text-to-speech failed: ${error.message}`);
    }
  }
}
