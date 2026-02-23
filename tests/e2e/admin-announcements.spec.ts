import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './utils';

test.describe('Admin Announcements', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/anuncios');
  });

  test('shows announcements management list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Anuncios' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Nuevo Anuncio' })).toBeVisible();
  });

  test('creates a new announcement and returns to list', async ({ page }) => {
    const title = `Anuncio E2E ${Date.now()}`;
    const message = 'Mensaje de prueba e2e para validar creación.';

    await page.getByRole('link', { name: 'Nuevo Anuncio' }).click();
    await expect(page).toHaveURL('/admin/anuncios/nuevo');
    await expect(page.getByRole('heading', { name: 'Nuevo Anuncio' })).toBeVisible();

    await page.locator('input[type="text"]').first().fill(title);
    await page.locator('textarea').first().fill(message);
    await page.getByRole('button', { name: 'Crear anuncio' }).click();

    await expect(page).toHaveURL('/admin/anuncios');
    await expect(page.getByText(title)).toBeVisible({ timeout: 15000 });
  });
});
