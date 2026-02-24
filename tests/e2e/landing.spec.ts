import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('renders hero, course section and primary CTAs', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /Aprende a Programar/i })).toBeVisible();
    await expect(page.getByText('Eduardo Rico').first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Comenzar a Aprender' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Crear Cuenta Gratis|Crear Cuenta/i }).first()).toBeVisible();
  });

  test('course CTA redirects unauthenticated users to signin with callback', async ({ page }) => {
    await page.goto('/');
    const courseCta = page.getByRole('link', { name: 'Ir al Curso' });
    await expect(courseCta).toBeVisible();
    await courseCta.scrollIntoViewIfNeeded();

    await Promise.all([
      page.waitForURL(/\/auth\/signin\?callbackUrl=(%2Ftutoriales%2Fpython-basico|\/tutoriales\/python-basico)/, { timeout: 30_000 }),
      courseCta.click(),
    ]);

    await expect(page).toHaveURL(/\/auth\/signin\?callbackUrl=(%2Ftutoriales%2Fpython-basico|\/tutoriales\/python-basico)/, { timeout: 30_000 });
    await expect(page.locator('input#email')).toBeVisible();
    await expect(page.getByRole('button', { name: /Iniciar sesión/i })).toBeVisible();
  });

  test('features and instructor sections are visible', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: '¿Por qué aprender aquí?' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Código Interactivo' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Contenido Estructurado' })).toBeVisible();
    await expect(page.getByText('Sobre el Instructor')).toBeVisible();
  });
});
