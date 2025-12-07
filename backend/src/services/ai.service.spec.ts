import { Test, TestingModule } from '@nestjs/testing';
import { AIService } from './ai.service';

describe('AIService', () => {
  let service: AIService;

  beforeEach(async () => {
    process.env.GEMINI_API_KEY = 'test-api-key';

    const module: TestingModule = await Test.createTestingModule({
      providers: [AIService],
    }).compile();

    service = module.get<AIService>(AIService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw error if GEMINI_API_KEY is not set', () => {
    delete process.env.GEMINI_API_KEY;
    
    expect(() => {
      new AIService();
    }).toThrow('Gemini API key is required');
  });

  describe('analyzeSymptoms', () => {
    it('should analyze symptoms and return response', async () => {
      // Mock the Gemini API response
      const mockResponse = {
        response: {
          text: () => 'Mock symptom analysis',
        },
      };

      jest.spyOn(service['model'], 'generateContent').mockResolvedValue(mockResponse as any);

      const result = await service.analyzeSymptoms('headache and fever', 'en');

      expect(result).toBe('Mock symptom analysis');
      expect(service['model'].generateContent).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      jest.spyOn(service['model'], 'generateContent').mockRejectedValue(new Error('API Error'));

      await expect(
        service.analyzeSymptoms('headache', 'en'),
      ).rejects.toThrow('Failed to analyze symptoms');
    });
  });

  describe('getDrugInteractions', () => {
    it('should check drug interactions', async () => {
      const mockResponse = {
        response: {
          text: () => 'Mock drug interaction analysis',
        },
      };

      jest.spyOn(service['model'], 'generateContent').mockResolvedValue(mockResponse as any);

      const result = await service.getDrugInteractions(['Aspirin', 'Ibuprofen']);

      expect(result).toBe('Mock drug interaction analysis');
    });
  });
});
