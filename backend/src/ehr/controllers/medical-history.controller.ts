import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { MedicalHistoryService } from '../services/medical-history.service';
import { CreateMedicalHistoryDto } from '../dto/create-medical-history.dto';
import { UpdateMedicalHistoryDto } from '../dto/update-medical-history.dto';

@Controller('ehr/medical-history')
@UseGuards(JwtAuthGuard)
export class MedicalHistoryController {
  constructor(private readonly medicalHistoryService: MedicalHistoryService) {}

  @Post()
  async create(@Request() req, @Body() createDto: CreateMedicalHistoryDto) {
    return this.medicalHistoryService.create(req.user.userId, createDto);
  }

  @Get()
  async findAll(@Request() req, @Query('familyHistory') familyHistory?: string) {
    if (familyHistory === 'true') {
      return this.medicalHistoryService.findFamilyHistory(req.user.userId);
    }
    return this.medicalHistoryService.findAll(req.user.userId);
  }

  @Get('search')
  async search(@Request() req, @Query('condition') condition: string) {
    return this.medicalHistoryService.findByCondition(req.user.userId, condition);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.medicalHistoryService.findOne(id, req.user.userId);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateMedicalHistoryDto,
  ) {
    return this.medicalHistoryService.update(id, req.user.userId, updateDto);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    await this.medicalHistoryService.remove(id, req.user.userId);
    return { message: 'Medical history record deleted successfully' };
  }
}
