import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { AIService } from './services/ai.service';

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
  async analyzeSymptoms(
    @Body() body: { symptoms: string; language?: string },
  ) {
    const response = await this.aiService.analyzeSymptoms(
      body.symptoms,
      body.language || 'en',
    );
    return { response };
  }

  @Post('ai/chat')
  async chatWithAI(
    @Body()
    body: {
      messages: Array<{ role: string; content: string }>;
      language?: string;
    },
  ) {
    const response = await this.aiService.chatWithAI(
      body.messages,
      body.language || 'en',
    );
    return { response };
  }

  @Post('ai/drug-interactions')
  async checkDrugInteractions(@Body() body: { medications: string[] }) {
    const response = await this.aiService.getDrugInteractions(body.medications);
    return { response };
  }
}
