import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { VoiceController } from './voice.controller';
import { AIService } from '../services/ai.service';
import { FDAService } from '../services/fda.service';
import { VoiceService } from '../services/voice.service';

@Module({
  controllers: [AIController, VoiceController],
  providers: [AIService, FDAService, VoiceService],
  exports: [AIService, FDAService, VoiceService],
})
export class AIModule {}
