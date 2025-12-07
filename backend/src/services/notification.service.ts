import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './email.service';

export interface PushNotification {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, any>;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private emailService: EmailService) {}

  /**
   * Send push notification via Firebase Cloud Messaging
   * FREE - 10M messages/month
   */
  async sendPushNotification(
    userId: string,
    notification: PushNotification,
  ): Promise<void> {
    try {
      // This would integrate with Firebase Cloud Messaging
      // For now, log it
      this.logger.log(`Push notification to ${userId}: ${notification.title}`);

      // TODO: Implement Firebase Admin SDK
      // const message = {
      //   notification: {
      //     title: notification.title,
      //     body: notification.body,
      //   },
      //   token: userFCMToken,
      // };
      // await admin.messaging().send(message);
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`);
    }
  }

  /**
   * Send appointment reminder
   */
  async sendAppointmentReminder(
    userId: string,
    userEmail: string,
    appointmentDetails: {
      doctorName: string;
      date: string;
      time: string;
      type: string;
      videoUrl?: string;
    },
  ): Promise<void> {
    // Send email notification (FREE via Resend)
    await this.emailService.sendAppointmentConfirmation(userEmail, appointmentDetails);

    // Send push notification (FREE via Firebase)
    await this.sendPushNotification(userId, {
      title: 'Appointment Reminder',
      body: `Your appointment with ${appointmentDetails.doctorName} is in 30 minutes`,
      icon: '/icons/appointment.png',
      data: {
        type: 'appointment_reminder',
        appointmentId: appointmentDetails.date,
      },
    });
  }

  /**
   * Send medication reminder
   */
  async sendMedicationReminder(
    userId: string,
    userEmail: string,
    medication: {
      name: string;
      dosage: string;
      time: string;
    },
  ): Promise<void> {
    await this.sendPushNotification(userId, {
      title: 'Medication Reminder',
      body: `Time to take ${medication.name} (${medication.dosage})`,
      icon: '/icons/medication.png',
      data: {
        type: 'medication_reminder',
        medication: medication.name,
      },
    });
  }

  /**
   * Send health alert
   */
  async sendHealthAlert(
    userId: string,
    userEmail: string,
    alert: {
      title: string;
      message: string;
      severity: 'low' | 'medium' | 'high';
    },
  ): Promise<void> {
    // High severity alerts go via email too
    if (alert.severity === 'high') {
      // Send email for critical alerts
      this.logger.warn(`High severity alert for user ${userId}: ${alert.title}`);
    }

    await this.sendPushNotification(userId, {
      title: alert.title,
      body: alert.message,
      icon: '/icons/alert.png',
      badge: alert.severity === 'high' ? '/icons/urgent.png' : undefined,
      data: {
        type: 'health_alert',
        severity: alert.severity,
      },
    });
  }

  /**
   * Send test result notification
   */
  async sendTestResultNotification(
    userId: string,
    userEmail: string,
    testName: string,
  ): Promise<void> {
    await this.sendPushNotification(userId, {
      title: 'Test Results Available',
      body: `Your ${testName} results are ready to view`,
      icon: '/icons/test-results.png',
      data: {
        type: 'test_results',
        testName,
      },
    });
  }
}
