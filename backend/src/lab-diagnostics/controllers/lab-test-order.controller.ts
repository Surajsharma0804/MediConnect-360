import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { LabTestOrderService } from '../services/lab-test-order.service';
import { CreateLabTestOrderDto } from '../dto/create-lab-test-order.dto';
import { LabTestStatus } from '../../entities/lab-test-order.entity';

@Controller('lab-test-orders')
@UseGuards(JwtAuthGuard)
export class LabTestOrderController {
  constructor(private readonly labTestOrderService: LabTestOrderService) {}

  @Post()
  create(@Request() req, @Body() createDto: CreateLabTestOrderDto) {
    return this.labTestOrderService.create(req.user.userId, createDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.labTestOrderService.findAll(req.user.userId);
  }

  @Get('home-kits')
  findHomeKits(@Request() req) {
    return this.labTestOrderService.findHomeKits(req.user.userId);
  }

  @Get('upcoming')
  findUpcoming(@Request() req) {
    return this.labTestOrderService.findUpcoming(req.user.userId);
  }

  @Get('statistics')
  getStatistics(@Request() req) {
    return this.labTestOrderService.getStatistics(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.labTestOrderService.findOne(id, req.user.userId);
  }

  @Patch(':id/status')
  updateStatus(
    @Request() req,
    @Param('id') id: string,
    @Body('status') status: LabTestStatus,
  ) {
    return this.labTestOrderService.updateStatus(
      id,
      req.user.userId,
      status,
    );
  }

  @Patch(':id/cancel')
  cancel(
    @Request() req,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.labTestOrderService.cancel(id, req.user.userId, reason);
  }
}
