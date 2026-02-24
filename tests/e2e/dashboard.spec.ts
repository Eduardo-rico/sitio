import { test, expect } from '@playwright/test';
import { createTestUser, loginUser, logoutFromDashboard, registerUser } from './utils';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    const user = createTestUser('dashboard');
    await registerUser(page, user);
    await loginUser(page, user);
  });

  test('shows dashboard main sections and sidebar links', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Bienvenido/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tu Progreso' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Resumen' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Mis Cursos' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Configuración' })).toBeVisible();
  });

  test('navigates to My Courses and Settings from sidebar', async ({ page }) => {
    const myCoursesLink = page.getByRole('link', { name: 'Mis Cursos' });
    await expect(myCoursesLink).toBeVisible();

    await Promise.all([
      page.waitForURL('**/dashboard/cursos', { timeout: 30_000 }),
      myCoursesLink.click(),
    ]);

    await expect(page).toHaveURL('/dashboard/cursos', { timeout: 30_000 });
    await expect(page.getByRole('heading', { name: 'Mis Cursos' })).toBeVisible();

    const settingsLink = page.getByRole('link', { name: 'Configuración' });
    await expect(settingsLink).toBeVisible();

    await Promise.all([
      page.waitForURL('**/dashboard/configuracion', { timeout: 30_000 }),
      settingsLink.click(),
    ]);

    await expect(page).toHaveURL('/dashboard/configuracion', { timeout: 30_000 });
    await expect(page.getByRole('heading', { name: 'Configuración' })).toBeVisible();
  });

  test('allows logout from dashboard header', async ({ page }) => {
    await logoutFromDashboard(page);
    await expect(page.getByText('Comenzar a Aprender')).toBeVisible();
  });
});
