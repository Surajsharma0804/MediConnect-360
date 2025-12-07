// Sentry Error Tracking Integration (FREE - 5,000 errors/month)

interface SentryConfig {
  dsn: string;
  environment: string;
  release?: string;
}

class SentryService {
  private initialized = false;
  private config: SentryConfig;

  constructor() {
    this.config = {
      dsn: import.meta.env.VITE_SENTRY_DSN || '',
      environment: import.meta.env.VITE_ENV || 'development',
      release: import.meta.env.VITE_APP_VERSION || '1.0.0',
    };
  }

  /**
   * Initialize Sentry
   * FREE - 5,000 errors/month
   */
  async init(): Promise<void> {
    if (this.initialized || !this.config.dsn) {
      console.log('Sentry not initialized: DSN not configured');
      return;
    }

    try {
      // Dynamically import Sentry to reduce bundle size
      const Sentry = await import('@sentry/react');
      const { BrowserTracing } = await import('@sentry/tracing');

      Sentry.init({
        dsn: this.config.dsn,
        environment: this.config.environment,
        release: this.config.release,
        integrations: [new BrowserTracing()],
        
        // Performance Monitoring
        tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
        
        // Only send errors in production
        enabled: this.config.environment === 'production',
        
        // Filter out sensitive data
        beforeSend(event) {
          // Remove sensitive data from error reports
          if (event.request) {
            delete event.request.cookies;
            delete event.request.headers;
          }
          return event;
        },
      });

      this.initialized = true;
      console.log('Sentry initialized');
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }

  /**
   * Capture exception
   */
  captureException(error: Error, context?: Record<string, any>): void {
    if (!this.initialized) {
      console.error('Sentry not initialized, logging error:', error);
      return;
    }

    import('@sentry/react').then((Sentry) => {
      if (context) {
        Sentry.setContext('additional_info', context);
      }
      Sentry.captureException(error);
    });
  }

  /**
   * Capture message
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
    if (!this.initialized) {
      console.log('Sentry not initialized, logging message:', message);
      return;
    }

    import('@sentry/react').then((Sentry) => {
      Sentry.captureMessage(message, level);
    });
  }

  /**
   * Set user context
   */
  setUser(user: { id: string; email?: string; username?: string }): void {
    if (!this.initialized) return;

    import('@sentry/react').then((Sentry) => {
      Sentry.setUser(user);
    });
  }

  /**
   * Clear user context (on logout)
   */
  clearUser(): void {
    if (!this.initialized) return;

    import('@sentry/react').then((Sentry) => {
      Sentry.setUser(null);
    });
  }

  /**
   * Add breadcrumb (for debugging context)
   */
  addBreadcrumb(message: string, category: string, data?: Record<string, any>): void {
    if (!this.initialized) return;

    import('@sentry/react').then((Sentry) => {
      Sentry.addBreadcrumb({
        message,
        category,
        data,
        level: 'info',
      });
    });
  }
}

export const sentry = new SentryService();
