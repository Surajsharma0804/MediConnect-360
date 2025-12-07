import { Controller, Post, Body } from '@nestjs/common';
import { AIService } from '../services/ai.service';
import { FDAService } from '../services/fda.service';
import {
  SymptomCheckDto,
  ChatDto,
  DrugInteractionDto,
} from '../auth/dto/symptom-check.dto';

@Controller('ai')
export class AIController {
  constructor(
    private readonly aiService: AIService,
    private readonly fdaService: FDAService,
  ) {}

  @Post('symptom-check')
  async analyzeSymptoms(@Body() dto: SymptomCheckDto) {
    const response = await this.aiService.analyzeSymptoms(
      dto.symptoms,
      dto.language || 'en',
    );
    return { response };
  }

  @Post('chat')
  async chatWithAI(@Body() dto: ChatDto) {
    const response = await this.aiService.chatWithAI(
      [{ role: 'user', content: dto.message }],
      dto.language || 'en',
    );
    return { response };
  }

  @Post('drug-interactions')
  async checkDrugInteractions(@Body() dto: DrugInteractionDto) {
    // Get AI analysis
    const aiResponse = await this.aiService.getDrugInteractions(
      dto.medications,
    );

    // Get FDA data for each medication
    const fdaData = await Promise.all(
      dto.medications.map(async (med) => {
        const info = await this.fdaService.searchDrug(med);
        return {
          medication: med,
          fdaInfo: info,
        };
      }),
    );

    return {
      aiAnalysis: aiResponse,
      fdaData,
      disclaimer:
        'This is NOT medical advice. Always consult a healthcare professional.',
    };
  }

  @Post('drug-info')
  async getDrugInfo(@Body() body: { drugName: string }) {
    const drugInfo = await this.fdaService.searchDrug(body.drugName);

    if (!drugInfo) {
      return {
        found: false,
        message: 'Drug not found in FDA database',
      };
    }

    return {
      found: true,
      data: drugInfo,
      disclaimer:
        'This information is from the FDA database. Always consult a healthcare professional.',
    };
  }

  @Post('drug-recalls')
  async getDrugRecalls(@Body() body: { drugName: string }) {
    const recalls = await this.fdaService.getDrugRecalls(body.drugName);

    return {
      drugName: body.drugName,
      recalls,
      count: recalls.length,
    };
  }
}
