import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('login page renders without errors', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /entrar/i })).toBeVisible();
    // No console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.waitForTimeout(1000);
    // Filter out expected Next.js dev mode warnings
    const realErrors = errors.filter(e => !e.includes('React DevTools') && !e.includes('Warning:'));
    expect(realErrors).toHaveLength(0);
  });

  test('register page renders without errors', async ({ page }) => {
    await page.goto('/register');
    // The register page should have a form
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('unauthenticated user is redirected from protected pages', async ({ page }) => {
    // Clear auth
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    });

    // Try accessing protected pages
    await page.goto('/documents');
    await page.waitForURL(/login/, { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  test('login page has correct subtitle', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Sistema de Análise Financeira')).toBeVisible();
  });
});
