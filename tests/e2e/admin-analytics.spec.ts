import { test, expect } from '@playwright/test';

const ADMIN_CREDENTIALS = {
  email: 'Charalo123',
  password: 'Charalo123'
};

test.describe('Admin Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('input#email', ADMIN_CREDENTIALS.email);
    await page.fill('input#password', ADMIN_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
    
    // Navigate to admin
    await page.goto('/admin');
  });

  test('should display analytics dashboard', async ({ page }) => {
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Estadísticas')).toBeVisible();
  });

  test('should show stats cards', async ({ page }) => {
    await expect(page.locator('[data-testid="stats-card"]').first()).toBeVisible();
  });

  test('should change date range filter', async ({ page }) => {
    const filter = page.locator('select[name="dateRange"]');
    await filter.selectOption('7d');
    await expect(page.locator('text=Últimos 7 días')).toBeVisible();
  });

  test('should display users chart', async ({ page }) => {
    await expect(page.locator('[data-testid="users-chart"]')).toBeVisible();
  });

  test('should display courses chart', async ({ page }) => {
    await expect(page.locator('[data-testid="courses-chart"]')).toBeVisible();
  });

  test('should display activity heatmap', async ({ page }) => {
    await expect(page.locator('[data-testid="activity-heatmap"]')).toBeVisible();
  });

  test('should display completion chart', async ({ page }) => {
    await expect(page.locator('[data-testid="completion-chart"]')).toBeVisible();
  });

  test('should refresh data', async ({ page }) => {
    await page.click('button[title="Actualizar"]');
    await expect(page.locator('text=Cargando')).toBeVisible();
  });
});
