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
import { EPrescriptionService } from '../services/e-prescription.service';
import { SendPrescriptionDto } from '../dto/send-prescription.dto';
import { UpdatePrescriptionStatusDto } from '../dto/update-prescription-status.dto';
import { EPrescription } from '../../entities/e-prescription.entity';

@Controller('api/e-prescriptions')
@UseGuards(JwtAuthGuard)
export class EPrescriptionController {
  constructor(private readonly ePrescriptionService: EPrescriptionService) {}

  @Post('send')
  async sendToPharmacy(
    @Request() req,
    @Body() dto: SendPrescriptionDto,
  ): Promise<EPrescription> {
    return this.ePrescriptionService.sendToPharmacy(
      req.user.userId,
      dto.prescriptionId,
      dto.pharmacyId,
      dto.deliveryMethod,
      dto.deliveryAddress,
    );
  }

  @Get()
  async findAll(@Request() req): Promise<EPrescription[]> {
    return this.ePrescriptionService.findByUser(req.user.userId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string): Promise<EPrescription> {
    return this.ePrescriptionService.findById(id, req.user.userId);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePrescriptionStatusDto,
  ): Promise<EPrescription> {
    return this.ePrescriptionService.updateStatus(id, dto.status, {
      finalCost: dto.finalCost,
      insuranceCoverage: dto.insuranceCoverage,
      copay: dto.copay,
      trackingNumber: dto.trackingNumber,
      notes: dto.notes,
    });
  }

  @Post(':id/cancel')
  async cancel(
    @Request() req,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ): Promise<EPrescription> {
    return this.ePrescriptionService.cancel(id, req.user.userId, reason);
  }

  @Post('refill/:prescriptionId')
  async requestRefill(
    @Request() req,
    @Param('prescriptionId') prescriptionId: string,
  ): Promise<EPrescription> {
    return this.ePrescriptionService.requestRefill(prescriptionId, req.user.userId);
  }

  @Post(':id/transfer')
  async transferPharmacy(
    @Request() req,
    @Param('id') id: string,
    @Body('pharmacyId') pharmacyId: string,
  ): Promise<EPrescription> {
    return this.ePrescriptionService.transferPharmacy(
      id,
      req.user.userId,
      pharmacyId,
    );
  }
}
