import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      this.logger.warn(
        'GEMINI_API_KEY is not set - AI features will be disabled',
      );
      // Don't throw error - allow service to initialize without API key for testing
      return;
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-2.5-flash - latest and fastest model
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    this.logger.log('AI Service initialized with Gemini 2.5 Flash');
  }

  async analyzeSymptoms(
    symptoms: string,
    language: string = 'en',
  ): Promise<string> {
    if (!this.model) {
      this.logger.warn('AI model not initialized - returning default response');
      return 'AI service is currently unavailable. Please consult with a healthcare professional for symptom analysis.';
    }

    try {
      const prompt = `You are a medical AI assistant for MediConnect 360. Analyze these symptoms and provide:

1. **Possible Conditions** (with probability percentage)
2. **Recommended Actions**
3. **When to Seek Emergency Care**
4. **General Health Advice**

IMPORTANT DISCLAIMERS:
- This is NOT a medical diagnosis
- Always recommend consulting a healthcare professional
- For emergencies, advise calling emergency services immediately

Respond in ${language} language.
Be empathetic, clear, and helpful.

Symptoms: ${symptoms}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      this.logger.error('Error analyzing symptoms:', error);
      throw new Error('Failed to analyze symptoms. Please try again.');
    }
  }

  async chatWithAI(
    messages: Array<{ role: string; content: string }>,
    language: string = 'en',
  ): Promise<string> {
    if (!this.model) {
      this.logger.warn('AI model not initialized - returning default response');
      return 'AI chat service is currently unavailable. Please consult with a healthcare professional.';
    }

    try {
      const systemMessage = `You are a helpful medical AI assistant for MediConnect 360.
- Provide accurate health information in ${language} language
- Be empathetic and supportive
- Always recommend consulting healthcare professionals for serious concerns
- Never provide definitive diagnoses
- Prioritize patient safety`;

      const chat = this.model.startChat({
        history: messages.slice(0, -1).map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        })),
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      });

      const lastMessage = messages[messages.length - 1];
      const result = await chat.sendMessage(
        systemMessage + '\n\nUser: ' + lastMessage.content,
      );
      return result.response.text();
    } catch (error) {
      this.logger.error('Error in AI chat:', error);
      throw new Error('Failed to get AI response. Please try again.');
    }
  }

  async analyzeImage(imageBase64: string, prompt: string): Promise<string> {
    if (!this.genAI) {
      this.logger.warn('AI model not initialized - returning default response');
      return 'AI image analysis service is currently unavailable. Please consult with a healthcare professional.';
    }

    try {
      // Gemini 2.5 Flash supports vision natively
      const visionModel = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
      });

      const result = await visionModel.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64,
          },
        },
      ]);

      return result.response.text();
    } catch (error) {
      this.logger.error('Error analyzing image:', error);
      throw new Error('Failed to analyze image. Please try again.');
    }
  }

  async getDrugInteractions(medications: string[]): Promise<string> {
    if (!this.model) {
      this.logger.warn('AI model not initialized - returning default response');
      return 'AI drug interaction service is currently unavailable. Please consult with a pharmacist or healthcare professional.';
    }

    try {
      const prompt = `As a medical AI, analyze potential drug interactions for these medications:
${medications.join(', ')}

Provide:
1. Known interactions (if any)
2. Severity level (mild, moderate, severe)
3. Recommendations
4. When to consult a doctor

Be clear and concise. Always recommend consulting a pharmacist or doctor.`;

      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      this.logger.error('Error checking drug interactions:', error);
      throw new Error('Failed to check drug interactions. Please try again.');
    }
  }
}
