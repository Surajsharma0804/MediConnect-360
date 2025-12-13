/**
 * Accessibility utilities for MediConnect 360
 * Ensures WCAG 2.1 AA compliance for healthcare platform
 */

/**
 * Focus management utilities
 */
export class FocusManager {
  private static focusStack: HTMLElement[] = [];

  /**
   * Save current focus and set new focus
   */
  static pushFocus(element: HTMLElement): void {
    const currentFocus = document.activeElement as HTMLElement;
    if (currentFocus) {
      this.focusStack.push(currentFocus);
    }
    element.focus();
  }

  /**
   * Restore previous focus
   */
  static popFocus(): void {
    const previousFocus = this.focusStack.pop();
    if (previousFocus) {
      previousFocus.focus();
    }
  }

  /**
   * Trap focus within an element (for modals, dialogs)
   */
  static trapFocus(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    // Focus first element
    firstElement?.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }
}

/**
 * Screen reader announcements
 */
export class ScreenReaderAnnouncer {
  private static liveRegion: HTMLElement | null = null;

  /**
   * Initialize live region for announcements
   */
  static init(): void {
    if (this.liveRegion) return;

    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.className = 'sr-only';
    this.liveRegion.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `;
    document.body.appendChild(this.liveRegion);
  }

  /**
   * Announce message to screen readers
   */
  static announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.liveRegion) this.init();
    
    this.liveRegion!.setAttribute('aria-live', priority);
    this.liveRegion!.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = '';
      }
    }, 1000);
  }
}

/**
 * Keyboard navigation utilities
 */
export class KeyboardNavigation {
  /**
   * Handle arrow key navigation for lists
   */
  static handleArrowKeys(
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onSelect: (index: number) => void
  ): void {
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        newIndex = Math.min(currentIndex + 1, items.length - 1);
        break;
      case 'ArrowUp':
        newIndex = Math.max(currentIndex - 1, 0);
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = items.length - 1;
        break;
      case 'Enter':
      case ' ':
        onSelect(currentIndex);
        return;
      default:
        return;
    }

    if (newIndex !== currentIndex) {
      event.preventDefault();
      items[newIndex]?.focus();
      onSelect(newIndex);
    }
  }

  /**
   * Handle escape key for closing modals/dropdowns
   */
  static handleEscape(event: KeyboardEvent, onEscape: () => void): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      onEscape();
    }
  }
}

/**
 * Color contrast utilities
 */
export class ColorContrast {
  /**
   * Calculate relative luminance of a color
   */
  private static getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Calculate contrast ratio between two colors
   */
  static getContrastRatio(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    if (!rgb1 || !rgb2) return 0;

    const lum1 = this.getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = this.getLuminance(rgb2.r, rgb2.g, rgb2.b);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  }

  /**
   * Convert hex color to RGB
   */
  private static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Check if contrast ratio meets WCAG standards
   */
  static meetsWCAG(foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean {
    const ratio = this.getContrastRatio(foreground, background);
    return level === 'AA' ? ratio >= 4.5 : ratio >= 7;
  }
}

/**
 * Form accessibility utilities
 */
export class FormAccessibility {
  /**
   * Associate label with form control
   */
  static associateLabel(input: HTMLElement, label: HTMLElement): void {
    const inputId = input.id || `input-${Date.now()}`;
    input.id = inputId;
    label.setAttribute('for', inputId);
  }

  /**
   * Add error message to form control
   */
  static addErrorMessage(input: HTMLElement, errorMessage: string): void {
    const errorId = `${input.id}-error`;
    let errorElement = document.getElementById(errorId);

    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = errorId;
      errorElement.className = 'error-message';
      errorElement.setAttribute('role', 'alert');
      input.parentNode?.insertBefore(errorElement, input.nextSibling);
    }

    errorElement.textContent = errorMessage;
    input.setAttribute('aria-describedby', errorId);
    input.setAttribute('aria-invalid', 'true');
  }

  /**
   * Remove error message from form control
   */
  static removeErrorMessage(input: HTMLElement): void {
    const errorId = `${input.id}-error`;
    const errorElement = document.getElementById(errorId);
    
    if (errorElement) {
      errorElement.remove();
    }
    
    input.removeAttribute('aria-describedby');
    input.removeAttribute('aria-invalid');
  }
}

/**
 * Reduced motion utilities
 */
export class ReducedMotion {
  /**
   * Check if user prefers reduced motion
   */
  static prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Apply animation only if motion is not reduced
   */
  static conditionalAnimation(element: HTMLElement, animation: () => void): void {
    if (!this.prefersReducedMotion()) {
      animation();
    }
  }
}

/**
 * Initialize accessibility features
 */
export function initializeAccessibility(): void {
  // Initialize screen reader announcer
  ScreenReaderAnnouncer.init();

  // Add skip link
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Skip to main content';
  skipLink.className = 'skip-link';
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 6px;
    background: #000;
    color: #fff;
    padding: 8px;
    text-decoration: none;
    z-index: 9999;
    border-radius: 4px;
  `;
  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '6px';
  });
  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });
  document.body.insertBefore(skipLink, document.body.firstChild);

  // Add main content landmark if not present
  if (!document.getElementById('main-content')) {
    const main = document.querySelector('main') || document.querySelector('#root > div');
    if (main) {
      main.id = 'main-content';
    }
  }

  // Announce page changes for SPA
  let currentPath = window.location.pathname;
  const observer = new MutationObserver(() => {
    if (window.location.pathname !== currentPath) {
      currentPath = window.location.pathname;
      const pageTitle = document.title;
      ScreenReaderAnnouncer.announce(`Navigated to ${pageTitle}`, 'polite');
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAccessibility);
  } else {
    initializeAccessibility();
  }
}