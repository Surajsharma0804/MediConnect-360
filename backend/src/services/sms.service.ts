import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SMSService {
  private readonly logger = new Logger(SMSService.name);

  constructor() {
    this.logger.log('SMSService initialized');
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    // For development, just log the SMS
    this.logger.log(`SMS would be sent to: ${to}`);
    this.logger.log(`Message: ${message}`);
    
    // In production, implement actual SMS sending
    return true;
  }

  async send2FACode(phone: string, code: string): Promise<boolean> {
    return this.sendSMS(
      phone,
      `Your MediConnect 360 verification code is: ${code}`
    );
  }

  async sendAppointmentReminder(phone: string, appointmentDetails: any): Promise<boolean> {
    return this.sendSMS(
      phone,
      `Reminder: You have an appointment on ${appointmentDetails.date} at ${appointmentDetails.time}`
    );
  }

  async sendEmergencyAlert(phone: string, alertDetails: any): Promise<boolean> {
    return this.sendSMS(
      phone,
      `EMERGENCY ALERT: ${alertDetails.message}. Location: ${alertDetails.location}`
    );
  }
}