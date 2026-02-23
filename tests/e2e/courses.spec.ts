import { test, expect } from '@playwright/test';
import { createTestUser, loginUser, registerUser } from './utils';

test.describe('Course Flow', () => {
  test.beforeEach(async ({ page }) => {
    const user = createTestUser('courses');
    await registerUser(page, user);
    await loginUser(page, user);
  });

  test('shows tutorials catalog with published courses', async ({ page }) => {
    await page.goto('/tutoriales');

    await expect(page.getByRole('heading', { name: 'Tutoriales Interactivos de Python' })).toBeVisible();
    await expect(page.getByText(/Python Basico/i)).toBeVisible();
    await expect(page.getByText(/Python Intermedio/i)).toBeVisible();
  });

  test('navigates from catalog to course detail', async ({ page }) => {
    await page.goto('/tutoriales');
    await page.getByText(/Python Basico/i).first().click();

    await expect(page).toHaveURL(/\/tutoriales\/[^/]+$/);
    await expect(page.getByRole('heading', { level: 2, name: 'Contenido del curso' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Comenzar/i })).toBeVisible();
  });

  test('opens first lesson and validates exercise panel', async ({ page }) => {
    await page.goto('/tutoriales/python-basico');
    const firstLessonLink = page.locator('a[href^="/tutoriales/python-basico/"]').first();
    await expect(firstLessonLink).toBeVisible();
    const lessonHref = await firstLessonLink.getAttribute('href');
    expect(lessonHref).toMatch(/^\/tutoriales\/python-basico\/[^/]+$/);
    await page.goto(lessonHref!);

    await expect(page).toHaveURL(/\/tutoriales\/[^/]+\/[^/]+$/);
    await expect(page.getByRole('button', { name: 'Ejecutar' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Verificar' })).toBeVisible();
  });
});
