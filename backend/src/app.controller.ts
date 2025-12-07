import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { AIService } from './services/ai.service';
import { SymptomCheckDto, ChatDto, DrugInteractionDto } from './auth/dto/symptom-check.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly aiService: AIService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'MediConnect 360 API',
      version: '1.0.0',
    };
  }

  @Post('ai/symptom-check')
  async analyzeSymptoms(@Body() dto: SymptomCheckDto) {
    const response = await this.aiService.analyzeSymptoms(
      dto.symptoms,
      dto.language || 'en',
    );
    return { response };
  }

  @Post('ai/chat')
  async chatWithAI(@Body() dto: ChatDto) {
    const response = await this.aiService.chatWithAI(
      [{ role: 'user', content: dto.message }],
      dto.language || 'en',
    );
    return { response };
  }

  @Post('ai/drug-interactions')
  async checkDrugInteractions(@Body() dto: DrugInteractionDto) {
    const response = await this.aiService.getDrugInteractions(dto.medications);
    return { response };
  }
}
