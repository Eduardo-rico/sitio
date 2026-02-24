import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './utils';

test.describe('Admin CMS', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('courses page renders management table', async ({ page }) => {
    await page.goto('/admin/cursos', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await expect(page.getByRole('heading', { name: /^Cursos$/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Nuevo Curso|Crear Curso/i }).first()).toBeVisible();
  });

  test('lessons and exercises creation pages render required forms', async ({ page }) => {
    await page.goto('/admin/lecciones/nueva', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await expect(page).toHaveURL(/\/admin\/lecciones\/nueva/);
    await expect(page.getByRole('heading', { name: /Nueva Lección|Nueva Leccion/i })).toBeVisible({ timeout: 30000 });
    await expect(page.locator('input[name="title"], input#title').first()).toBeVisible({ timeout: 30000 });

    await page.goto('/admin/ejercicios/nuevo', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await expect(page).toHaveURL(/\/admin\/ejercicios\/nuevo/);
    await expect(page.getByRole('heading', { name: /Nuevo Ejercicio/i })).toBeVisible({ timeout: 30000 });
    await expect(page.locator('input[name="title"], input#title').first()).toBeVisible({ timeout: 30000 });
  });
});
