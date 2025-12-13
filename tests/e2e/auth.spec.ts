import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should redirect to login page when not authenticated', async ({ page }) => {
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('h1')).toContainText('Sign in to MediConnect 360');
  });

  test('should display login form with proper accessibility', async ({ page }) => {
    await page.goto('/login');
    
    // Check form elements exist
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check accessibility attributes
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('aria-label');
    await expect(emailInput).toHaveAttribute('required');
    
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toHaveAttribute('aria-label');
    await expect(passwordInput).toHaveAttribute('required');
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Check for validation messages
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });

  test('should handle login failure gracefully', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('[role="alert"]')).toContainText(/invalid/i);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/login');
    
    // Tab through form elements
    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="email"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('input[type="password"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('button[type="submit"]')).toBeFocused();
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('/login');
    
    // Check main content has proper role
    await expect(page.locator('main')).toHaveAttribute('role', 'main');
    
    // Check form has proper labeling
    const form = page.locator('form');
    await expect(form).toBeVisible();
    
    // Check heading structure
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toHaveAttribute('id');
  });

  test('should work with screen reader announcements', async ({ page }) => {
    await page.goto('/login');
    
    // Check for live region
    const liveRegion = page.locator('[aria-live]');
    await expect(liveRegion).toBeAttached();
  });
});

test.describe('OAuth Authentication', () => {
  test('should display OAuth login options', async ({ page }) => {
    await page.goto('/login');
    
    // Check for Google OAuth button
    const googleButton = page.locator('button:has-text("Continue with Google")');
    await expect(googleButton).toBeVisible();
    
    // Check for GitHub OAuth button
    const githubButton = page.locator('button:has-text("Continue with GitHub")');
    await expect(githubButton).toBeVisible();
  });

  test('should have proper accessibility for OAuth buttons', async ({ page }) => {
    await page.goto('/login');
    
    const oauthButtons = page.locator('button[aria-label*="Continue with"]');
    const count = await oauthButtons.count();
    
    for (let i = 0; i < count; i++) {
      const button = oauthButtons.nth(i);
      await expect(button).toHaveAttribute('aria-label');
      await expect(button).toHaveAttribute('type', 'button');
    }
  });
});