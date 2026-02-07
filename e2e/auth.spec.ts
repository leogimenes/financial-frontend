import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any stored auth state
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    });
  });

  test('should show login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /entrar/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/senha/i)).toBeVisible();
  });

  test('should show register link on login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('Cadastre-se')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');
    await page.getByText('Cadastre-se').click();
    await expect(page).toHaveURL(/register/);
  });

  test('should redirect to login when accessing protected page without auth', async ({ page }) => {
    await page.goto('/documents');
    await expect(page).toHaveURL(/login/);
  });

  test('should show validation for empty login form', async ({ page }) => {
    await page.goto('/login');
    // Try to submit empty form
    await page.getByRole('button', { name: /entrar/i }).click();
    // HTML5 validation should prevent submission
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toBeVisible();
  });
});
