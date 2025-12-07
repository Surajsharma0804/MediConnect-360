import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { WearableService } from '../services/wearable.service';
import { WearableType } from '../../entities/wearable-device.entity';

@Controller('integrations/wearables')
@UseGuards(JwtAuthGuard)
export class WearableController {
  constructor(private readonly wearableService: WearableService) {}

  @Post()
  connectDevice(
    @Request() req,
    @Body()
    body: {
      deviceType: WearableType;
      deviceName: string;
      accessToken?: string;
      refreshToken?: string;
    },
  ) {
    return this.wearableService.connectDevice(
      req.user.userId,
      body.deviceType,
      body.deviceName,
      body.accessToken,
      body.refreshToken,
    );
  }

  @Get()
  findAll(@Request() req) {
    return this.wearableService.findAll(req.user.userId);
  }

  @Get('statistics')
  getStatistics(@Request() req) {
    return this.wearableService.getStatistics(req.user.userId);
  }

  @Get('sync-history')
  getSyncHistory(@Request() req) {
    return this.wearableService.getSyncHistory(req.user.userId);
  }

  @Post('sync-all')
  syncAllDevices(@Request() req) {
    return this.wearableService.syncAllDevices(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.wearableService.findOne(id, req.user.userId);
  }

  @Delete(':id')
  disconnectDevice(@Request() req, @Param('id') id: string) {
    return this.wearableService.disconnectDevice(id, req.user.userId);
  }

  @Post(':id/sync')
  syncDevice(@Request() req, @Param('id') id: string) {
    return this.wearableService.syncDevice(id, req.user.userId);
  }

  @Patch(':id/settings')
  updateSettings(
    @Request() req,
    @Param('id') id: string,
    @Body()
    settings: {
      autoSync?: boolean;
      syncFrequencyMinutes?: number;
      syncedDataTypes?: string[];
    },
  ) {
    return this.wearableService.updateSettings(id, req.user.userId, settings);
  }
}
