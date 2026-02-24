import { test, expect } from '@playwright/test';
import { createTestUser, loginUser, registerUser } from './utils';

test.describe('Mobile UX', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('opens and uses mobile navigation menu', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Abrir menú' }).click();
    const mobileMenu = page.locator('div.fixed.top-16.right-0.bottom-0.w-72');
    await expect(mobileMenu).toBeVisible();
    await expect(mobileMenu.getByRole('link', { name: 'Inicio', exact: true })).toBeVisible();
    await expect(mobileMenu.getByRole('link', { name: 'Cursos', exact: true })).toBeVisible();

    await mobileMenu.getByRole('link', { name: 'Cursos', exact: true }).click();
    await expect(page).toHaveURL(/\/auth\/signin\?callbackUrl=%2Ftutoriales/);
  });

  test('tutorial cards render correctly on mobile', async ({ page }) => {
    const user = createTestUser('mobile-course-list');
    await registerUser(page, user);
    await loginUser(page, user);

    await page.goto('/tutoriales');

    const firstCourse = page.locator('main a[href^="/tutoriales/"]').first();
    await expect(firstCourse).toBeVisible();

    const box = await firstCourse.boundingBox();
    expect(box).not.toBeNull();
    expect((box?.width ?? 0) <= 360).toBeTruthy();
  });

  test('auth form controls are touch friendly', async ({ page }) => {
    await page.goto('/auth/signin');

    const submitButton = page.getByRole('button', { name: 'Iniciar sesión' });
    await expect(submitButton).toBeVisible();
    const box = await submitButton.boundingBox();
    expect((box?.height ?? 0) >= 44).toBeTruthy();
  });

  test('layout avoids horizontal overflow on mobile', async ({ page }) => {
    await page.goto('/');

    const dimensions = await page.evaluate(() => ({
      bodyWidth: document.body.scrollWidth,
      viewportWidth: window.innerWidth,
    }));
    expect(dimensions.bodyWidth).toBeLessThanOrEqual(dimensions.viewportWidth + 1);
  });
});
