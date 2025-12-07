import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  /**
   * Track user events (backend-side)
   * FREE - No API key needed for basic tracking
   */
  async trackEvent(
    userId: string,
    eventName: string,
    properties?: Record<string, any>,
  ): Promise<void> {
    try {
      // Log event for monitoring
      this.logger.log(`Event: ${eventName} | User: ${userId} | Properties: ${JSON.stringify(properties)}`);

      // In production, you could send to:
      // - Google Analytics 4 Measurement Protocol (FREE)
      // - Your own analytics database
      // - Third-party analytics service

      // For now, just log it
      // You can implement GA4 Measurement Protocol here if needed
    } catch (error) {
      this.logger.error(`Failed to track event: ${error.message}`);
    }
  }

  /**
   * Track user registration
   */
  async trackRegistration(userId: string, method: 'email' | 'google' | 'github'): Promise<void> {
    await this.trackEvent(userId, 'user_registered', {
      method,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track login
   */
  async trackLogin(userId: string, method: 'email' | 'google' | 'github'): Promise<void> {
    await this.trackEvent(userId, 'user_login', {
      method,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track AI usage
   */
  async trackAIUsage(
    userId: string,
    feature: 'symptom_check' | 'chat' | 'drug_interaction',
    tokensUsed?: number,
  ): Promise<void> {
    await this.trackEvent(userId, 'ai_usage', {
      feature,
      tokensUsed,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track appointment booking
   */
  async trackAppointmentBooked(
    userId: string,
    appointmentId: string,
    type: 'video' | 'phone' | 'in_person',
  ): Promise<void> {
    await this.trackEvent(userId, 'appointment_booked', {
      appointmentId,
      type,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track errors (for monitoring)
   */
  async trackError(
    userId: string | null,
    error: Error,
    context?: Record<string, any>,
  ): Promise<void> {
    this.logger.error(`Error tracked: ${error.message}`, error.stack);
    
    await this.trackEvent(userId || 'anonymous', 'error_occurred', {
      errorMessage: error.message,
      errorStack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    });
  }
}
