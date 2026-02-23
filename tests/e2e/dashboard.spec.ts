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
    await page.getByRole('link', { name: 'Mis Cursos' }).click();
    await expect(page).toHaveURL('/dashboard/cursos');
    await expect(page.getByRole('heading', { name: 'Mis Cursos' })).toBeVisible();

    await page.getByRole('link', { name: 'Configuración' }).click();
    await expect(page).toHaveURL('/dashboard/configuracion');
    await expect(page.getByRole('heading', { name: 'Configuración' })).toBeVisible();
  });

  test('allows logout from dashboard header', async ({ page }) => {
    await logoutFromDashboard(page);
    await expect(page.getByText('Comenzar a Aprender')).toBeVisible();
  });
});
