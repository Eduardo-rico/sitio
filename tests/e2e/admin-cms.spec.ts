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

  test('edits bibliography from admin with CRUD and URL validation', async ({ page }) => {
    const title = `Referencia E2E ${Date.now()}`;
    const initialUrl = `https://example.com/${Date.now()}`;
    const updatedUrl = `https://example.com/${Date.now()}/actualizada`;

    await page.goto('/admin/cursos', { waitUntil: 'domcontentloaded', timeout: 45000 });
    const firstCourseRow = page.locator('tbody tr').first();
    await expect(firstCourseRow).toBeVisible({ timeout: 30000 });

    const editLink = firstCourseRow.locator('a[href^="/admin/cursos/"]').last();
    await expect(editLink).toBeVisible({ timeout: 30000 });
    await editLink.click();

    await expect(page).toHaveURL(/\/admin\/cursos\/[^/]+$/, { timeout: 30000 });
    await expect(page.getByTestId('course-bibliography-editor')).toBeVisible({ timeout: 30000 });

    await page.getByTestId('bibliography-new-title').fill(title);
    await page.getByTestId('bibliography-new-url').fill(initialUrl);
    await page.getByTestId('bibliography-new-note').fill('Referencia creada en e2e');
    await page.getByTestId('bibliography-create-button').click();

    await expect(page.getByTestId('course-bibliography-success')).toContainText(/agregada/i);
    const createdCard = page.locator('[data-testid^="bibliography-item-"]').filter({
      has: page.locator(`input[value="${title}"]`),
    }).first();
    await expect(createdCard).toBeVisible({ timeout: 30000 });

    const createdUrlInput = createdCard.locator('input[data-testid^="bibliography-item-url-"]').first();
    const saveButton = createdCard.locator('button[data-testid^="bibliography-item-save-"]').first();

    await createdUrlInput.fill('url-invalida');
    await saveButton.click();
    await expect(page.getByTestId('course-bibliography-error')).toContainText(/url|URL/);

    await createdUrlInput.fill(updatedUrl);
    const updateResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/bibliography/') &&
        response.request().method() === 'PUT' &&
        response.status() === 200
    );
    await saveButton.click();
    await updateResponse;
    await expect(createdUrlInput).toHaveValue(updatedUrl);

    page.once('dialog', (dialog) => dialog.accept());
    await createdCard.locator('button[data-testid^="bibliography-item-delete-"]').first().click();
    await expect(page.locator(`input[value="${title}"]`)).toHaveCount(0);
  });
});
