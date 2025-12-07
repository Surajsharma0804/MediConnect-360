import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SMSService {
  private readonly logger = new Logger(SMSService.name);

  async sendOTP(phone: string, otp: string): Promise<{ success: boolean; provider: string }> {
    // For development, just log to console
    console.log('\n' + '='.repeat(60));
    console.log('📱 SMS NOTIFICATION');
    console.log('='.repeat(60));
    console.log(`To: ${phone}`);
    console.log(`Message: Your MediConnect 360 verification code is: ${otp}`);
    console.log(`This code will expire in 10 minutes.`);
    console.log('='.repeat(60) + '\n');

    this.logger.log(`OTP sent to ${phone}: ${otp}`);
    return { success: true, provider: 'console' };

    // TODO: Add real SMS provider when ready
    // if (process.env.SMS_PROVIDER === 'twilio') {
    //   return this.sendViaTwilio(phone, `Your verification code is: ${otp}`);
    // }
  }

  async sendAppointmentReminder(phone: string, appointment: any): Promise<{ success: boolean }> {
    console.log('\n' + '='.repeat(60));
    console.log('📱 SMS REMINDER');
    console.log('='.repeat(60));
    console.log(`To: ${phone}`);
    console.log(`Message: Reminder: You have an appointment with Dr. ${appointment.doctorName} at ${appointment.time}`);
    console.log('='.repeat(60) + '\n');

    this.logger.log(`Appointment reminder sent to ${phone}`);
    return { success: true };
  }

  async sendEmergencyAlert(phone: string, location: string): Promise<{ success: boolean }> {
    console.log('\n' + '='.repeat(60));
    console.log('🚨 EMERGENCY ALERT');
    console.log('='.repeat(60));
    console.log(`To: ${phone}`);
    console.log(`Message: EMERGENCY: Your emergency contact has triggered an SOS alert at ${location}`);
    console.log('='.repeat(60) + '\n');

    this.logger.warn(`Emergency alert sent to ${phone}`);
    return { success: true };
  }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
