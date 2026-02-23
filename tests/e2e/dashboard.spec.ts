import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'testuser_e2e@example.com',
  password: 'TestPassword123!',
  name: 'Test User E2E'
};

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada test
    await page.goto('/auth/signin');
    await page.fill('input#email', TEST_USER.email);
    await page.fill('input#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
  });

  test('debería mostrar el dashboard con información del usuario', async ({ page }) => {
    // Verificar elementos del dashboard
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator(`text=${TEST_USER.name}`)).toBeVisible();
    
    // Verificar navegación del sidebar
    await expect(page.locator('text=Resumen')).toBeVisible();
    await expect(page.locator('text=Mis Cursos')).toBeVisible();
    await expect(page.locator('text=Configuración')).toBeVisible();
  });

  test('debería navegar a Mis Cursos', async ({ page }) => {
    await page.click('text=Mis Cursos');
    await expect(page).toHaveURL('/dashboard/cursos');
    await expect(page.locator('h1, h2').filter({ hasText: /curso/i })).toBeVisible();
  });

  test('debería navegar a Configuración', async ({ page }) => {
    await page.click('text=Configuración');
    await expect(page).toHaveURL('/dashboard/configuracion');
    await expect(page.locator('text=Configuración')).toBeVisible();
  });

  test('debería poder volver al sitio desde el dashboard', async ({ page }) => {
    await page.click('text=Volver al sitio');
    await expect(page).toHaveURL('/');
  });
});
