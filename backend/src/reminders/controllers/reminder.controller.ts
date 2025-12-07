import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ReminderService } from '../services/reminder.service';
import {
  ReminderType,
  ReminderFrequency,
} from '../../entities/reminder.entity';

@Controller('reminders')
@UseGuards(JwtAuthGuard)
export class ReminderController {
  constructor(private readonly reminderService: ReminderService) {}

  @Post()
  create(@Request() req, @Body() body: any) {
    return this.reminderService.create(req.user.userId, {
      ...body,
      reminderTime: new Date(body.reminderTime),
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    });
  }

  @Get()
  findAll(@Request() req) {
    return this.reminderService.findAll(req.user.userId);
  }

  @Get('upcoming')
  findUpcoming(@Request() req, @Query('hours') hours?: string) {
    return this.reminderService.findUpcoming(
      req.user.userId,
      hours ? parseInt(hours) : 24,
    );
  }

  @Get('statistics')
  getStatistics(@Request() req) {
    return this.reminderService.getStatistics(req.user.userId);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.reminderService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.reminderService.update(id, req.user.userId, body);
  }

  @Delete(':id')
  delete(@Request() req, @Param('id') id: string) {
    return this.reminderService.delete(id, req.user.userId);
  }

  @Post(':id/snooze')
  snooze(
    @Request() req,
    @Param('id') id: string,
    @Body('minutes') minutes: number,
  ) {
    return this.reminderService.snooze(id, req.user.userId, minutes);
  }

  @Post(':id/complete')
  complete(@Request() req, @Param('id') id: string) {
    return this.reminderService.complete(id, req.user.userId);
  }

  @Post('medication')
  createMedicationReminder(@Request() req, @Body() body: any) {
    return this.reminderService.createMedicationReminder(req.user.userId, {
      ...body,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    });
  }
}
