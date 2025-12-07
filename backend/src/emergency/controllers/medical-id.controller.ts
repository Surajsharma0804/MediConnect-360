import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { MedicalIDService } from '../services/medical-id.service';
import { CreateMedicalIDDto } from '../dto/create-medical-id.dto';

@Controller('emergency/medical-id')
export class MedicalIDController {
  constructor(private readonly medicalIDService: MedicalIDService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req, @Body() createDto: CreateMedicalIDDto) {
    return this.medicalIDService.create(req.user.userId, createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findByUserId(@Request() req) {
    return this.medicalIDService.findByUserId(req.user.userId);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  async update(@Request() req, @Body() updateDto: CreateMedicalIDDto) {
    return this.medicalIDService.update(req.user.userId, updateDto);
  }

  @Get('public/:userId')
  async findPublicMedicalID(@Param('userId') userId: string) {
    return this.medicalIDService.findPublicMedicalID(userId);
  }

  @Post('toggle-visibility')
  @UseGuards(JwtAuthGuard)
  async toggleVisibility(@Request() req) {
    return this.medicalIDService.toggleVisibility(req.user.userId);
  }
}
