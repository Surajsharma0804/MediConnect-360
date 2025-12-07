import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { HealthTrackingService } from '../services/health-tracking.service';
import { CreateTrackingDto } from '../dto/create-tracking.dto';
import { UpdateTrackingDto } from '../dto/update-tracking.dto';
import { TrackingType } from '../../entities/health-tracking.entity';

@Controller('health-tracking')
@UseGuards(JwtAuthGuard)
export class HealthTrackingController {
  constructor(private readonly healthTrackingService: HealthTrackingService) {}

  @Post()
  async create(@Request() req, @Body() createDto: CreateTrackingDto) {
    return this.healthTrackingService.create(req.user.userId, createDto);
  }

  @Get()
  async findAll(
    @Request() req,
    @Query('type') type?: TrackingType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
  ) {
    return this.healthTrackingService.findAll(
      req.user.userId,
      type,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      limit ? parseInt(limit.toString()) : 100,
    );
  }

  @Get('stats')
  async getStats(
    @Request() req,
    @Query('type') type: TrackingType,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.healthTrackingService.getStats(
      req.user.userId,
      type,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.healthTrackingService.findOne(id, req.user.userId);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateTrackingDto,
  ) {
    return this.healthTrackingService.update(id, req.user.userId, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Request() req, @Param('id') id: string) {
    await this.healthTrackingService.delete(id, req.user.userId);
  }
}
