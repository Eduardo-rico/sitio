import { test, expect } from '@playwright/test';

test.describe('Tutorial Pages', () => {
  test('catalog page loads with interactive Python messaging', async ({ page }) => {
    await page.goto('/tutoriales');

    await expect(page.getByRole('heading', { name: 'Tutoriales Interactivos de Python' })).toBeVisible();
    await expect(page.getByText('Aprende Python ejecutando código')).toBeVisible();
  });

  test('navigates to a specific published course', async ({ page }) => {
    await page.goto('/tutoriales', { waitUntil: 'domcontentloaded' });
    const pythonBasicoLink = page.locator('a[href="/tutoriales/python-basico"]').first();
    await expect(pythonBasicoLink).toBeVisible({ timeout: 30000 });
    await pythonBasicoLink.click();

    await expect(page).toHaveURL(/\/tutoriales\/python-basico$/, { timeout: 30000 });
    await expect(page.getByRole('heading', { name: /Python Basico|Python Básico/i })).toBeVisible({
      timeout: 30000,
    });
  });

  test('admin page requires authentication', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/auth\/signin\?callbackUrl=%2Fadmin|\/auth\/signin\?callbackUrl=\/admin/);
  });
});
