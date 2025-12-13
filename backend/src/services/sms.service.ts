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
}