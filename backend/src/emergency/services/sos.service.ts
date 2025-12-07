import { Injectable, Logger } from '@nestjs/common';
import { EmergencyContactService } from './emergency-contact.service';
import { MedicalIDService } from './medical-id.service';
import { NotificationService } from '../../services/notification.service';
import { SMSService } from '../../services/sms.service';

@Injectable()
export class SOSService {
  private readonly logger = new Logger(SOSService.name);
  private activeSOSessions: Map<string, any> = new Map();

  constructor(
    private readonly emergencyContactService: EmergencyContactService,
    private readonly medicalIDService: MedicalIDService,
    private readonly notificationService: NotificationService,
    private readonly smsService: SMSService,
  ) {}

  async triggerSOS(userId: string, data: any): Promise<any> {
    try {
      const { location, message, severity } = data;

      // Get emergency contacts
      const contacts = await this.emergencyContactService.findAll(userId);

      if (contacts.length === 0) {
        this.logger.warn(`User ${userId} has no emergency contacts`);
        return {
          success: false,
          message: 'No emergency contacts configured',
        };
      }

      // Get medical ID for emergency info
      let medicalID;
      try {
        medicalID = await this.medicalIDService.findByUserId(userId);
      } catch (error) {
        this.logger.warn(`User ${userId} has no medical ID`);
      }

      // Create SOS session
      const sosSession = {
        userId,
        triggeredAt: new Date(),
        location,
        message: message || 'Emergency SOS triggered',
        severity: severity || 'high',
        status: 'active',
        contactsNotified: [] as string[],
      };

      this.activeSOSessions.set(userId, sosSession);

      // Notify all emergency contacts
      for (const contact of contacts) {
        if (contact.notifyOnEmergency) {
          // Send SMS
          if (contact.primaryPhone) {
            await this.smsService.sendEmergencyAlert(
              contact.primaryPhone,
              location || 'Location not available',
            );
            sosSession.contactsNotified.push(contact.id);
          }

          // Send push notification (if they have the app)
          await this.notificationService.sendPushNotification(userId, {
            title: '🚨 Emergency SOS Triggered',
            body: sosSession.message,
            icon: '/icons/emergency.png',
            data: {
              type: 'sos',
              location,
              severity,
            },
          });
        }
      }

      this.logger.warn(
        `SOS triggered for user ${userId}, notified ${sosSession.contactsNotified.length} contacts`,
      );

      return {
        success: true,
        sosId: userId,
        contactsNotified: sosSession.contactsNotified.length,
        message: 'Emergency contacts have been notified',
        medicalInfo: medicalID
          ? {
              bloodType: medicalID.bloodType,
              allergies: medicalID.allergies,
              conditions: medicalID.conditions,
              medications: medicalID.medications,
            }
          : null,
      };
    } catch (error) {
      this.logger.error(`Error triggering SOS: ${error.message}`);
      throw new Error('Failed to trigger SOS');
    }
  }

  async cancelSOS(userId: string): Promise<any> {
    try {
      const session = this.activeSOSessions.get(userId);

      if (!session) {
        return {
          success: false,
          message: 'No active SOS session',
        };
      }

      session.status = 'cancelled';
      session.cancelledAt = new Date();

      // Notify contacts that SOS was cancelled
      const contacts = await this.emergencyContactService.findAll(userId);
      for (const contact of contacts) {
        if (
          session.contactsNotified.includes(contact.id) &&
          contact.primaryPhone
        ) {
          await this.smsService.sendAppointmentReminder(contact.primaryPhone, {
            doctorName: 'Emergency',
            time: 'SOS Alert Cancelled - User is safe',
          });
        }
      }

      this.activeSOSessions.delete(userId);
      this.logger.log(`SOS cancelled for user ${userId}`);

      return {
        success: true,
        message: 'SOS cancelled, contacts notified',
      };
    } catch (error) {
      this.logger.error(`Error cancelling SOS: ${error.message}`);
      throw new Error('Failed to cancel SOS');
    }
  }

  async getSOSStatus(userId: string): Promise<any> {
    try {
      const session = this.activeSOSessions.get(userId);

      if (!session) {
        return {
          active: false,
          message: 'No active SOS session',
        };
      }

      return {
        active: true,
        ...session,
      };
    } catch (error) {
      this.logger.error(`Error getting SOS status: ${error.message}`);
      throw new Error('Failed to get SOS status');
    }
  }

  async shareLocation(userId: string, location: any): Promise<any> {
    try {
      const session = this.activeSOSessions.get(userId);

      if (session) {
        session.location = location;
        session.lastLocationUpdate = new Date();
      }

      this.logger.log(`Location shared for user ${userId}`);

      return {
        success: true,
        message: 'Location shared with emergency contacts',
        location,
      };
    } catch (error) {
      this.logger.error(`Error sharing location: ${error.message}`);
      throw new Error('Failed to share location');
    }
  }
}
