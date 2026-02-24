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

    await expect(page.getByRole('heading', { name: 'Tutoriales Interactivos de Programación' })).toBeVisible();
    await expect(page.locator('a[href=\"/tutoriales/python-basico\"]').first()).toBeVisible({ timeout: 45000 });
    await expect(page.locator('a[href=\"/tutoriales/python-intermedio\"]').first()).toBeVisible({ timeout: 45000 });
    await expect(page.locator('a[href=\"/tutoriales/javascript-desde-cero\"]').first()).toBeVisible({ timeout: 45000 });
    await expect(page.locator('a[href=\"/tutoriales/rust-desde-cero\"]').first()).toBeVisible({ timeout: 45000 });
  });

  test('navigates from catalog to course detail', async ({ page }) => {
    await page.goto('/tutoriales');
    await page.getByText(/Python Basico/i).first().click();

    await expect(page).toHaveURL(/\/tutoriales\/[^/]+$/);
    await expect(page.getByRole('heading', { level: 2, name: 'Contenido del curso' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Comenzar/i })).toBeVisible();
  });

  test('enrolls user when starting a course and shows it in dashboard', async ({ page }) => {
    await page.goto('/tutoriales/python-basico');
    await page.getByRole('button', { name: /Comenzar/i }).click();

    await expect(page).toHaveURL(/\/tutoriales\/python-basico\/[^/]+$/, {
      timeout: 45000,
    });

    await page.goto('/dashboard/cursos');
    await expect(page).toHaveURL(/\/dashboard\/cursos/);
    await expect(page.getByText(/Python Basico|Python Básico/i)).toBeVisible();
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

  test('executes python code in first lesson without pyodide load error', async ({ page }) => {
    await page.goto('/tutoriales/python-basico');
    const firstLessonLink = page.locator('a[href^="/tutoriales/python-basico/"]').first();
    await expect(firstLessonLink).toBeVisible();

    const lessonHref = await firstLessonLink.getAttribute('href');
    expect(lessonHref).toMatch(/^\/tutoriales\/python-basico\/[^/]+$/);
    await page.goto(lessonHref!);

    const executeButton = page.getByRole('button', { name: 'Ejecutar' });
    await expect(executeButton).toBeVisible();
    await executeButton.click();

    const outputPanel = page.locator('.output-panel');
    await expect(outputPanel).toContainText(
      /(Ejecutando|sin producir salida|Salida estándar|Error)/i,
      {
        timeout: 45000,
      }
    );
    await expect(outputPanel).not.toContainText('Pyodide no pudo cargarse', { timeout: 45000 });
    await expect(outputPanel).not.toContainText('Timeout al cargar Pyodide', { timeout: 45000 });
    await expect(outputPanel).not.toContainText('Ejecuta el código para ver el resultado', {
      timeout: 45000,
    });
  });
});
