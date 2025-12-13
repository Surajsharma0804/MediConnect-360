import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    this.logger.log('EmailService initialized');
  }

  async sendEmail(to: string, subject: string, content: string): Promise<boolean> {
    // For development, just log the email
    this.logger.log(`Email would be sent to: ${to}`);
    this.logger.log(`Subject: ${subject}`);
    this.logger.log(`Content: ${content}`);
    
    // In production, implement actual email sending with Resend
    return true;
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    return this.sendEmail(
      email,
      'Welcome to MediConnect 360',
      `Hello ${name}, welcome to MediConnect 360!`
    );
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    return this.sendEmail(
      email,
      'Password Reset - MediConnect 360',
      `Click here to reset your password: ${resetToken}`
    );
  }
}