// Web Vitals Performance Monitoring
interface PerformanceMetric {
  name: string;
  value: number;
  id: string;
  delta: number;
}

export const reportWebVitals = (onPerfEntry?: (metric: PerformanceMetric) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS(onPerfEntry);
      onINP(onPerfEntry); // INP replaced FID in web-vitals v4+
      onFCP(onPerfEntry);
      onLCP(onPerfEntry);
      onTTFB(onPerfEntry);
    });
  }
};

// Performance Observer for monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  private constructor() {
    this.initObservers();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initObservers() {
    if (typeof window === 'undefined') return;

    // Observe long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn('Long task detected:', entry);
              this.recordMetric('longTask', entry.duration);
            }
          }
        });
        observer.observe({ entryTypes: ['longtask'] });
      } catch {
        // Long tasks not supported
      }
    }
  }

  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  getMetrics(name: string) {
    return this.metrics.get(name) || [];
  }

  getAverageMetric(name: string): number {
    const values = this.getMetrics(name);
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  clearMetrics() {
    this.metrics.clear();
  }

  // Measure component render time
  measureRender(componentName: string, callback: () => void) {
    const start = performance.now();
    callback();
    const duration = performance.now() - start;
    this.recordMetric(`render:${componentName}`, duration);
    
    if (duration > 16) { // More than one frame (60fps)
      console.warn(`Slow render detected in ${componentName}: ${duration.toFixed(2)}ms`);
    }
  }

  // Measure API call time
  async measureApiCall<T>(name: string, apiCall: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await apiCall();
      const duration = performance.now() - start;
      this.recordMetric(`api:${name}`, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(`api:${name}:error`, duration);
      throw error;
    }
  }

  // Get performance report
  getReport(): Record<string, { count: number; average: number; min: number; max: number }> {
    const report: Record<string, { count: number; average: number; min: number; max: number }> = {};
    
    this.metrics.forEach((values, name) => {
      report[name] = {
        count: values.length,
        average: this.getAverageMetric(name),
        min: Math.min(...values),
        max: Math.max(...values),
      };
    });

    return report;
  }

  // Log performance report to console
  logReport() {
    console.table(this.getReport());
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Utility to measure function execution time
export function measureTime<T>(fn: () => T, label?: string): T {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  
  if (label) {
    console.log(`${label}: ${duration.toFixed(2)}ms`);
  }
  
  return result;
}

// Utility to measure async function execution time
export async function measureTimeAsync<T>(
  fn: () => Promise<T>,
  label?: string
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  
  if (label) {
    console.log(`${label}: ${duration.toFixed(2)}ms`);
  }
  
  return result;
}
