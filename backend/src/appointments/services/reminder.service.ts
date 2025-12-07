import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import {
  Appointment,
  AppointmentStatus,
} from '../../entities/appointment.entity';
import { NotificationService } from '../../services/notification.service';
import { EmailService } from '../../services/email.service';
import { SMSService } from '../../services/sms.service';

@Injectable()
export class ReminderService {
  private readonly logger = new Logger(ReminderService.name);

  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly notificationService: NotificationService,
    private readonly emailService: EmailService,
    private readonly smsService: SMSService,
  ) {}

  // Run every hour to check for upcoming appointments
  @Cron(CronExpression.EVERY_HOUR)
  async sendReminders() {
    try {
      const now = new Date();

      // Get appointments in next 24 hours
      const upcomingAppointments = await this.appointmentRepository.find({
        where: {
          scheduledAt: MoreThan(now),
          status: AppointmentStatus.CONFIRMED,
        },
        relations: ['patient', 'doctor'],
      });

      for (const appointment of upcomingAppointments) {
        const timeUntil = appointment.scheduledAt.getTime() - now.getTime();
        const hoursUntil = timeUntil / (60 * 60 * 1000);

        // Send 24-hour reminder
        if (hoursUntil <= 24 && hoursUntil > 23) {
          await this.send24HourReminder(appointment);
        }

        // Send 1-hour reminder
        if (hoursUntil <= 1 && hoursUntil > 0.5) {
          this.send1HourReminder(appointment);
        }
      }

      this.logger.log(
        `Processed ${upcomingAppointments.length} appointment reminders`,
      );
    } catch (error) {
      this.logger.error(`Error sending reminders: ${error.message}`);
    }
  }

  private async send24HourReminder(appointment: Appointment) {
    try {
      const message = `Reminder: You have an appointment tomorrow at ${appointment.scheduledAt.toLocaleTimeString()}`;

      // Send email
      await this.emailService.sendAppointmentConfirmation(
        appointment.patient.email,
        {
          doctorName: appointment.doctor.name,
          date: appointment.scheduledAt.toLocaleDateString(),
          time: appointment.scheduledAt.toLocaleTimeString(),
          type: appointment.type,
          videoUrl: appointment.videoRoomUrl,
        },
      );

      // Send push notification
      this.notificationService.sendPushNotification(appointment.patientId, {
        title: 'Appointment Reminder',
        body: message,
        icon: '/icons/appointment.png',
      });

      this.logger.log(
        `Sent 24-hour reminder for appointment ${appointment.id}`,
      );
    } catch (error) {
      this.logger.error(`Error sending 24-hour reminder: ${error.message}`);
    }
  }

  private send1HourReminder(appointment: Appointment) {
    try {
      const message = `Reminder: Your appointment is in 1 hour at ${appointment.scheduledAt.toLocaleTimeString()}`;

      // Send SMS if phone number available
      if (appointment.patient.phone) {
        this.smsService.sendAppointmentReminder(appointment.patient.phone, {
          doctorName: appointment.doctor.name,
          time: appointment.scheduledAt.toLocaleTimeString(),
        });
      }

      // Send push notification
      this.notificationService.sendPushNotification(appointment.patientId, {
        title: 'Appointment Starting Soon',
        body: message,
        icon: '/icons/appointment.png',
      });

      this.logger.log(`Sent 1-hour reminder for appointment ${appointment.id}`);
    } catch (error) {
      this.logger.error(`Error sending 1-hour reminder: ${error.message}`);
    }
  }

  scheduleCustomReminder(
    appointmentId: string,
    _reminderTime: Date,
    _message: string,
  ): void {
    try {
      // In production, use a job queue like Bull
      this.logger.log(
        `Scheduled custom reminder for appointment ${appointmentId}`,
      );
    } catch (error) {
      this.logger.error(`Error scheduling custom reminder: ${error.message}`);
      throw new Error('Failed to schedule reminder');
    }
  }
}
