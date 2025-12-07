// Google Analytics 4 Integration (FREE)

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

class AnalyticsService {
  private initialized = false;
  private measurementId: string;

  constructor() {
    this.measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || '';
  }

  /**
   * Initialize Google Analytics
   * FREE - Unlimited events
   */
  init(): void {
    if (this.initialized || !this.measurementId) {
      return;
    }

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.measurementId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', this.measurementId);

    this.initialized = true;
    console.log('Google Analytics initialized');
  }

  /**
   * Track page view
   */
  trackPageView(path: string, title?: string): void {
    if (!this.initialized) return;

    window.gtag?.('event', 'page_view', {
      page_path: path,
      page_title: title,
    });
  }

  /**
   * Track custom event
   */
  trackEvent(event: AnalyticsEvent): void {
    if (!this.initialized) return;

    window.gtag?.('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
    });
  }

  /**
   * Track user registration
   */
  trackRegistration(method: 'email' | 'google' | 'github'): void {
    this.trackEvent({
      action: 'sign_up',
      category: 'engagement',
      label: method,
    });
  }

  /**
   * Track user login
   */
  trackLogin(method: 'email' | 'google' | 'github'): void {
    this.trackEvent({
      action: 'login',
      category: 'engagement',
      label: method,
    });
  }

  /**
   * Track AI feature usage
   */
  trackAIUsage(feature: 'symptom_check' | 'chat' | 'drug_interaction'): void {
    this.trackEvent({
      action: 'ai_usage',
      category: 'features',
      label: feature,
    });
  }

  /**
   * Track appointment booking
   */
  trackAppointmentBooked(type: 'video' | 'phone' | 'in_person'): void {
    this.trackEvent({
      action: 'appointment_booked',
      category: 'conversion',
      label: type,
    });
  }

  /**
   * Track video call started
   */
  trackVideoCallStarted(): void {
    this.trackEvent({
      action: 'video_call_started',
      category: 'engagement',
    });
  }

  /**
   * Track search
   */
  trackSearch(searchTerm: string): void {
    this.trackEvent({
      action: 'search',
      category: 'engagement',
      label: searchTerm,
    });
  }

  /**
   * Set user properties
   */
  setUserProperties(userId: string, properties: Record<string, unknown>): void {
    if (!this.initialized) return;

    window.gtag?.('set', 'user_properties', {
      user_id: userId,
      ...properties,
    });
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const analytics = new AnalyticsService();
