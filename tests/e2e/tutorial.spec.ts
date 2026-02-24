import { test, expect } from '@playwright/test';
import { createTestUser, loginUser, registerUser } from './utils';

test.describe('Tutorial Pages', () => {
  test('tutorial pages require authentication', async ({ page }) => {
    await page.goto('/tutoriales');
    await expect(page).toHaveURL(/\/auth\/signin\?callbackUrl=%2Ftutoriales|\/auth\/signin\?callbackUrl=\/tutoriales/);
  });

  test.describe('authenticated users', () => {
    test.beforeEach(async ({ page }) => {
      const user = createTestUser('tutorial');
      await registerUser(page, user);
      await loginUser(page, user);
    });

    test('catalog page loads with interactive messaging', async ({ page }) => {
      await page.goto('/tutoriales');
      await expect(page.getByRole('heading', { name: 'Tutoriales Interactivos de Programación' })).toBeVisible();
      await expect(page.getByText('Aprende y practica con cursos interactivos')).toBeVisible();
      await expect(page.getByTestId('issue-report-fab')).toBeVisible();
    });

    test('navigates to a specific published course', async ({ page }) => {
      await page.goto('/tutoriales', { waitUntil: 'domcontentloaded' });
      const pythonBasicoLink = page.locator('a[href=\"/tutoriales/python-basico\"]').first();
      await expect(pythonBasicoLink).toBeVisible({ timeout: 30000 });
      await pythonBasicoLink.click();

      await expect(page).toHaveURL(/\/tutoriales\/python-basico$/, { timeout: 30000 });
      await expect(page.getByRole('heading', { name: /Python Basico|Python Básico/i })).toBeVisible({
        timeout: 30000,
      });
      await expect(page.getByTestId('issue-report-fab')).toBeVisible();
    });
  });

  test('admin page requires authentication', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/auth\/signin\?callbackUrl=%2Fadmin|\/auth\/signin\?callbackUrl=\/admin/);
  });
});
