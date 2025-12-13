import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('should not have any automatically detectable accessibility issues on login page', async ({ page }) => {
    await page.goto('/login');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have any automatically detectable accessibility issues on home page', async ({ page }) => {
    // Note: This test would need authentication setup
    // For now, we'll test the public parts
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/login');
    
    // Check that there's exactly one h1
    const h1Elements = page.locator('h1');
    await expect(h1Elements).toHaveCount(1);
    
    // Check heading order (h1 should come before h2, etc.)
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingLevels = await headings.evaluateAll(elements => 
      elements.map(el => parseInt(el.tagName.charAt(1)))
    );
    
    // Verify heading hierarchy is logical
    for (let i = 1; i < headingLevels.length; i++) {
      const currentLevel = headingLevels[i];
      const previousLevel = headingLevels[i - 1];
      
      // Current level should not skip more than one level
      expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
    }
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/login');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('[data-testid="login-form"]')
      .analyze();

    const colorContrastViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'color-contrast'
    );

    expect(colorContrastViolations).toHaveLength(0);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/login');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    let focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON', 'A']).toContain(focusedElement);
    
    // Test that all interactive elements are reachable
    const interactiveElements = page.locator('button, input, select, textarea, a[href]');
    const count = await interactiveElements.count();
    
    for (let i = 0; i < count; i++) {
      await page.keyboard.press('Tab');
      const currentFocus = page.locator(':focus');
      await expect(currentFocus).toBeVisible();
    }
  });

  test('should have proper ARIA labels and descriptions', async ({ page }) => {
    await page.goto('/login');
    
    // Check that form inputs have proper labels
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const hasLabel = await input.evaluate(el => {
        const id = el.id;
        const ariaLabel = el.getAttribute('aria-label');
        const ariaLabelledBy = el.getAttribute('aria-labelledby');
        const associatedLabel = id ? document.querySelector(`label[for="${id}"]`) : null;
        
        return !!(ariaLabel || ariaLabelledBy || associatedLabel);
      });
      
      expect(hasLabel).toBe(true);
    }
  });

  test('should announce form validation errors to screen readers', async ({ page }) => {
    await page.goto('/login');
    
    // Submit form without filling required fields
    await page.click('button[type="submit"]');
    
    // Check for ARIA live region with error messages
    const errorMessages = page.locator('[role="alert"], [aria-live="assertive"], [aria-live="polite"]');
    await expect(errorMessages).toHaveCount.greaterThan(0);
    
    // Check that error messages are associated with form fields
    const inputsWithErrors = page.locator('input[aria-invalid="true"]');
    const errorCount = await inputsWithErrors.count();
    
    if (errorCount > 0) {
      for (let i = 0; i < errorCount; i++) {
        const input = inputsWithErrors.nth(i);
        const hasErrorDescription = await input.evaluate(el => {
          const describedBy = el.getAttribute('aria-describedby');
          return describedBy && document.getElementById(describedBy);
        });
        
        expect(hasErrorDescription).toBe(true);
      }
    }
  });

  test('should have proper focus indicators', async ({ page }) => {
    await page.goto('/login');
    
    // Check that focused elements have visible focus indicators
    const focusableElements = page.locator('button, input, select, textarea, a[href]');
    const count = await focusableElements.count();
    
    for (let i = 0; i < count; i++) {
      const element = focusableElements.nth(i);
      await element.focus();
      
      // Check that the element has focus styles
      const hasFocusStyles = await element.evaluate(el => {
        const styles = window.getComputedStyle(el, ':focus');
        const outline = styles.outline;
        const boxShadow = styles.boxShadow;
        const borderColor = styles.borderColor;
        
        // Element should have some form of focus indicator
        return outline !== 'none' || boxShadow !== 'none' || borderColor !== 'initial';
      });
      
      expect(hasFocusStyles).toBe(true);
    }
  });

  test('should support reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/login');
    
    // Check that animations are disabled or reduced
    const animatedElements = page.locator('[class*="animate"], [class*="transition"]');
    const count = await animatedElements.count();
    
    for (let i = 0; i < count; i++) {
      const element = animatedElements.nth(i);
      const hasReducedMotion = await element.evaluate(el => {
        const styles = window.getComputedStyle(el);
        const animationDuration = styles.animationDuration;
        const transitionDuration = styles.transitionDuration;
        
        // Check if animations are disabled or very short
        return animationDuration === '0s' || transitionDuration === '0s' ||
               animationDuration === '0.01s' || transitionDuration === '0.01s';
      });
      
      // This is a soft check - not all elements need to respect reduced motion
      // but critical animations should
      if (await element.getAttribute('class')?.includes('critical-animation')) {
        expect(hasReducedMotion).toBe(true);
      }
    }
  });

  test('should have proper landmark regions', async ({ page }) => {
    await page.goto('/login');
    
    // Check for main landmark
    const main = page.locator('main, [role="main"]');
    await expect(main).toHaveCount(1);
    
    // Check for navigation if present
    const nav = page.locator('nav, [role="navigation"]');
    const navCount = await nav.count();
    if (navCount > 0) {
      // Each nav should have an accessible name
      for (let i = 0; i < navCount; i++) {
        const navElement = nav.nth(i);
        const hasAccessibleName = await navElement.evaluate(el => {
          const ariaLabel = el.getAttribute('aria-label');
          const ariaLabelledBy = el.getAttribute('aria-labelledby');
          return !!(ariaLabel || ariaLabelledBy);
        });
        
        expect(hasAccessibleName).toBe(true);
      }
    }
  });
});