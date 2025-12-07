import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PrescriptionService } from '../services/prescription.service';
import { CreatePrescriptionDto } from '../dto/create-prescription.dto';
import { UpdatePrescriptionDto } from '../dto/update-prescription.dto';

@Controller('ehr/prescriptions')
@UseGuards(JwtAuthGuard)
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @Post()
  async create(@Request() req, @Body() createDto: CreatePrescriptionDto) {
    return this.prescriptionService.create(req.user.userId, createDto);
  }

  @Get()
  async findAll(@Request() req, @Query('activeOnly') activeOnly?: string) {
    return this.prescriptionService.findAll(
      req.user.userId,
      activeOnly === 'true',
    );
  }

  @Get('due-for-refill')
  async getDueForRefill(@Request() req) {
    return this.prescriptionService.getDueForRefill(req.user.userId);
  }

  @Get('adherence')
  async getAdherence(
    @Request() req,
    @Query('prescriptionId') prescriptionId?: string,
  ) {
    const rate = await this.prescriptionService.getAdherenceRate(
      req.user.userId,
      prescriptionId,
    );
    return { adherenceRate: rate };
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.prescriptionService.findOne(id, req.user.userId);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdatePrescriptionDto,
  ) {
    return this.prescriptionService.update(id, req.user.userId, updateDto);
  }

  @Post(':id/refill')
  async requestRefill(@Request() req, @Param('id') id: string) {
    return this.prescriptionService.requestRefill(id, req.user.userId);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    await this.prescriptionService.remove(id, req.user.userId);
    return { message: 'Prescription deleted successfully' };
  }
}
