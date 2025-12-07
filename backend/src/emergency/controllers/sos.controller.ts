import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SOSService } from '../services/sos.service';
import { TriggerSOSDto } from '../dto/trigger-sos.dto';

@Controller('emergency/sos')
@UseGuards(JwtAuthGuard)
export class SOSController {
  constructor(private readonly sosService: SOSService) {}

  @Post()
  async triggerSOS(@Request() req, @Body() triggerDto: TriggerSOSDto) {
    return this.sosService.triggerSOS(req.user.userId, triggerDto);
  }

  @Post('cancel')
  async cancelSOS(@Request() req) {
    return this.sosService.cancelSOS(req.user.userId);
  }

  @Get('status')
  async getSOSStatus(@Request() req) {
    return this.sosService.getSOSStatus(req.user.userId);
  }

  @Post('location')
  async shareLocation(@Request() req, @Body('location') location: any) {
    return this.sosService.shareLocation(req.user.userId, location);
  }
}
