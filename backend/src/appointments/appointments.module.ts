import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentController } from './controllers/appointment.controller';
import { AppointmentService } from './services/appointment.service';
import { SchedulingService } from './services/scheduling.service';
import { ReminderService } from './services/reminder.service';
import { NotificationService } from '../services/notification.service';
import { EmailService } from '../services/email.service';
import { SMSService } from '../services/sms.service';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment])],
  controllers: [AppointmentController],
  providers: [
    AppointmentService,
    SchedulingService,
    ReminderService,
    NotificationService,
    EmailService,
    SMSService,
  ],
  exports: [AppointmentService, SchedulingService, ReminderService],
})
export class AppointmentsModule {}
