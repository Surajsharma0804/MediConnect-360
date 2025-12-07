import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private fromEmail: string;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY || '');
    this.fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
  }

  async sendVerificationEmail(
    to: string,
    token: string,
    name: string,
  ): Promise<void> {
    try {
      const verificationUrl = `${process.env.CORS_ORIGIN}/verify-email?token=${token}`;

      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: 'Verify your MediConnect 360 account',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🏥 Welcome to MediConnect 360!</h1>
                </div>
                <div class="content">
                  <h2>Hi ${name},</h2>
                  <p>Thank you for joining MediConnect 360 - your global health companion!</p>
                  <p>Please verify your email address to activate your account and start your journey to better health.</p>
                  <center>
                    <a href="${verificationUrl}" class="button">Verify Email Address</a>
                  </center>
                  <p>Or copy and paste this link into your browser:</p>
                  <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
                  <p><strong>This link will expire in 24 hours.</strong></p>
                  <p>If you didn't create an account, please ignore this email.</p>
                </div>
                <div class="footer">
                  <p>© 2024 MediConnect 360. Making healthcare accessible to everyone, everywhere.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      this.logger.log(`Verification email sent to ${to}`);
    } catch (error) {
      this.logger.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendPasswordReset(
    to: string,
    token: string,
    name: string,
  ): Promise<void> {
    try {
      const resetUrl = `${process.env.CORS_ORIGIN}/reset-password?token=${token}`;

      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: 'Reset your MediConnect 360 password',
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: Arial, sans-serif;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #667eea;">Reset Your Password</h1>
                <p>Hi ${name},</p>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                <a href="${resetUrl}" style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
                <p>Or copy this link: ${resetUrl}</p>
                <p><strong>This link will expire in 1 hour.</strong></p>
                <p>If you didn't request this, please ignore this email.</p>
              </div>
            </body>
          </html>
        `,
      });

      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      this.logger.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendAppointmentConfirmation(
    to: string,
    appointment: any,
  ): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: 'Appointment Confirmed - MediConnect 360',
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: Arial, sans-serif;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #667eea;">✅ Appointment Confirmed</h1>
                <p>Your appointment has been confirmed!</p>
                <div style="background: #f9f9f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
                  <p><strong>Doctor:</strong> ${appointment.doctorName}</p>
                  <p><strong>Date:</strong> ${appointment.date}</p>
                  <p><strong>Time:</strong> ${appointment.time}</p>
                  <p><strong>Type:</strong> ${appointment.type}</p>
                </div>
                ${appointment.videoUrl ? `<a href="${appointment.videoUrl}" style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">Join Video Call</a>` : ''}
                <p style="margin-top: 20px;">We'll send you a reminder 30 minutes before your appointment.</p>
              </div>
            </body>
          </html>
        `,
      });

      this.logger.log(`Appointment confirmation sent to ${to}`);
    } catch (error) {
      this.logger.error('Error sending appointment confirmation:', error);
      throw new Error('Failed to send appointment confirmation');
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject: 'Welcome to MediConnect 360! 🎉',
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: Arial, sans-serif;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #667eea;">Welcome to MediConnect 360! 🎉</h1>
                <p>Hi ${name},</p>
                <p>Your account is now active! Here's what you can do:</p>
                <ul>
                  <li>🤖 Chat with our AI health assistant</li>
                  <li>👨‍⚕️ Book video consultations with doctors</li>
                  <li>📊 Track your health metrics</li>
                  <li>📁 Store your medical records securely</li>
                  <li>🌍 Access in 50+ languages</li>
                </ul>
                <a href="${process.env.CORS_ORIGIN}/dashboard" style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Go to Dashboard</a>
                <p>Need help? Reply to this email or visit our help center.</p>
                <p>Stay healthy! 💪</p>
              </div>
            </body>
          </html>
        `,
      });

      this.logger.log(`Welcome email sent to ${to}`);
    } catch (error) {
      this.logger.error('Error sending welcome email:', error);
      // Don't throw error for welcome email
    }
  }
}
