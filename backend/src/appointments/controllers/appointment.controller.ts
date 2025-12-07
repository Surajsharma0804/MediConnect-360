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
import { AppointmentService } from '../services/appointment.service';
import { SchedulingService } from '../services/scheduling.service';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { UpdateAppointmentDto } from '../dto/update-appointment.dto';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly schedulingService: SchedulingService,
  ) {}

  @Post()
  async create(@Request() req, @Body() createDto: CreateAppointmentDto) {
    return this.appointmentService.create(req.user.userId, createDto);
  }

  @Get()
  async findAll(@Request() req, @Query('upcoming') upcoming?: string) {
    return this.appointmentService.findAll(
      req.user.userId,
      upcoming === 'true',
    );
  }

  @Get('available-slots')
  async getAvailableSlots(
    @Query('providerId') providerId: string,
    @Query('date') date: string,
    @Query('duration') duration?: string,
  ) {
    return this.schedulingService.getAvailableSlots(
      providerId,
      new Date(date),
      duration ? parseInt(duration) : 30,
    );
  }

  @Get('next-available')
  async getNextAvailable(
    @Query('providerId') providerId: string,
    @Query('duration') duration?: string,
  ) {
    return this.schedulingService.findNextAvailable(
      providerId,
      new Date(),
      duration ? parseInt(duration) : 30,
    );
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.appointmentService.findOne(id, req.user.userId);
  }

  @Put(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateAppointmentDto,
  ) {
    return this.appointmentService.update(id, req.user.userId, updateDto);
  }

  @Post(':id/cancel')
  async cancel(
    @Request() req,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.appointmentService.cancel(id, req.user.userId, reason);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    await this.appointmentService.cancel(
      id,
      req.user.userId,
      'Deleted by user',
    );
    return { message: 'Appointment cancelled successfully' };
  }
}
