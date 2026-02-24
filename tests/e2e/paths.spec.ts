import { test, expect, type Page } from '@playwright/test';
import { createTestUser, loginAsAdmin, loginUser, registerUser } from './utils';

async function expectSuccessfulPageLoad(page: Page, path: string) {
  const response = await page.goto(path, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  expect(response, `No hubo response para ${path}`).toBeTruthy();
  expect(response!.status(), `Status inesperado en ${path}`).toBeLessThan(400);
}

test.describe('Path Smoke', () => {
  test('anonymous users are redirected from protected paths', async ({ page }) => {
    const protectedPaths = [
      '/tutoriales',
      '/dashboard',
      '/dashboard/cursos',
      '/dashboard/configuracion',
      '/admin',
      '/admin/cursos',
      '/admin/tickets',
    ];

    for (const path of protectedPaths) {
      await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await expect(page).toHaveURL(/\/auth\/signin\?callbackUrl=/);
    }
  });

  test('logged user can access learner paths and is blocked from admin', async ({ page }) => {
    const user = createTestUser('paths-user');
    await registerUser(page, user);
    await loginUser(page, user);

    const userPaths = [
      '/',
      '/cv',
      '/dashboard',
      '/dashboard/cursos',
      '/dashboard/configuracion',
      '/tutoriales',
      '/tutoriales/python-basico',
      '/tutoriales/python-basico/basico-hola-variables',
    ];

    for (const path of userPaths) {
      await expectSuccessfulPageLoad(page, path);
    }

    await page.goto('/admin', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('admin can access management paths', async ({ page }) => {
    await loginAsAdmin(page);

    const adminPaths = [
      '/admin',
      '/admin/usuarios',
      '/admin/users',
      '/admin/cursos',
      '/admin/cursos/nuevo',
      '/admin/lecciones',
      '/admin/lecciones/nueva',
      '/admin/ejercicios',
      '/admin/ejercicios/nuevo',
      '/admin/anuncios',
      '/admin/anuncios/nuevo',
      '/admin/tickets',
    ];

    for (const path of adminPaths) {
      await expectSuccessfulPageLoad(page, path);
      await expect(page).toHaveURL(new RegExp(`^.*${path.replace(/\//g, '\\/')}`));
    }
  });
});
