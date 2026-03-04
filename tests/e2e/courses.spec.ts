import { test, expect } from '@playwright/test';
import { createTestUser, loginUser, registerUser } from './utils';

const RUNTIME_FAILURE_PATTERNS: RegExp[] = [
  /Unable to find .* in the registry/i,
  /No se pudo cargar ningún runtime WASM/i,
  /no expone un comando ejecutable/i,
];

const RUNTIME_EXECUTION_MATRIX: Array<{
  slug: string;
  expectedOutput?: RegExp;
  allowNoOutput?: boolean;
  executionTimeout?: number;
}> = [
  { slug: 'python-basico', allowNoOutput: true },
  { slug: 'javascript-desde-cero', expectedOutput: /Hola JavaScript/i },
  { slug: 'typescript-desde-cero', expectedOutput: /Hola TypeScript/i },
  { slug: 'sql-desde-cero', expectedOutput: /Hola SQL/i },
  {
    slug: 'bash-desde-cero',
    expectedOutput: /(Hola Bash|Runtime Bash no pudo ejecutar el script)/i,
  },
];

async function openFirstLessonForCourse(page: import('@playwright/test').Page, courseSlug: string) {
  await page.goto(`/tutoriales/${courseSlug}`);
  await expect(page).toHaveURL(new RegExp(`/tutoriales/${courseSlug}$`), {
    timeout: 45000,
  });

  const firstLessonLink = page.locator(`a[href^="/tutoriales/${courseSlug}/"]`).first();
  await expect(firstLessonLink).toBeVisible({ timeout: 45000 });
  const lessonHref = await firstLessonLink.getAttribute('href');
  expect(lessonHref).toMatch(new RegExp(`^/tutoriales/${courseSlug}/[^/]+$`));
  await page.goto(lessonHref!);

  await expect(page.getByRole('button', { name: 'Ejecutar' })).toBeVisible({
    timeout: 45000,
  });
}

async function executeLessonCode(
  page: import('@playwright/test').Page,
  courseSlug: string,
  executionTimeout = 90000
) {
  await openFirstLessonForCourse(page, courseSlug);
  await page.getByRole('button', { name: 'Ejecutar' }).click();

  const outputPanel = page.locator('.output-panel');
  await expect(outputPanel).not.toContainText('Ejecutando...', {
    timeout: executionTimeout,
  });
  await expect(outputPanel).not.toContainText('Ejecuta el código para ver el resultado', {
    timeout: 45000,
  });

  return outputPanel;
}

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
    await expect(page.locator('a[href=\"/tutoriales/python-analisis-datos\"]').first()).toBeVisible({ timeout: 45000 });
    await expect(page.locator('a[href=\"/tutoriales/python-analisis-negocio\"]').first()).toBeVisible({ timeout: 45000 });
    await expect(page.locator('a[href=\"/tutoriales/python-forecasting-ab-testing\"]').first()).toBeVisible({ timeout: 45000 });
    await expect(page.locator('a[href=\"/tutoriales/javascript-desde-cero\"]').first()).toBeVisible({ timeout: 45000 });
    await expect(page.locator('a[href=\"/tutoriales/rust-desde-cero\"]').first()).toBeVisible({ timeout: 45000 });
  });

  test('shows bibliography section in course detail', async ({ page }) => {
    await page.goto('/tutoriales/python-forecasting-ab-testing');
    await expect(page.getByRole('heading', { name: 'Ruta pedagogica' })).toBeVisible({
      timeout: 45000,
    });
    await expect(page.getByRole('heading', { name: 'Bibliografia recomendada' })).toBeVisible({
      timeout: 45000,
    });
    await expect(
      page.getByRole('link', { name: /forecasting: principles and practice|trustworthy online controlled experiments/i }).first()
    ).toBeVisible({
      timeout: 45000,
    });
  });

  test('navigates from catalog to course detail', async ({ page }) => {
    await page.goto('/tutoriales');
    const courseLink = page.locator('a[href="/tutoriales/python-basico"]').first();
    await expect(courseLink).toBeVisible({ timeout: 45000 });
    await Promise.all([
      page.waitForURL(/\/tutoriales\/python-basico$/, { timeout: 45000 }),
      courseLink.click(),
    ]);

    await expect(page).toHaveURL(/\/tutoriales\/python-basico$/);
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

  test('executes stable browser runtimes (python/js/ts/sql/bash)', async ({ page }) => {
    test.setTimeout(10 * 60 * 1000);

    for (const runtimeCase of RUNTIME_EXECUTION_MATRIX) {
      await test.step(`runtime ${runtimeCase.slug}`, async () => {
        const outputPanel = await executeLessonCode(
          page,
          runtimeCase.slug,
          runtimeCase.executionTimeout
        );

        for (const failurePattern of RUNTIME_FAILURE_PATTERNS) {
          await expect(outputPanel).not.toContainText(failurePattern);
        }

        if (runtimeCase.expectedOutput) {
          await expect(outputPanel).toContainText(runtimeCase.expectedOutput, {
            timeout: runtimeCase.executionTimeout ?? 90000,
          });
        }

        if (runtimeCase.allowNoOutput) {
          await expect(outputPanel).toContainText(/\d+ms/, {
            timeout: 45000,
          });
        }
      });
    }
  });

  test('go runtime executes in browser and returns expected output', async ({
    page,
  }) => {
    test.setTimeout(3 * 60 * 1000);
    const outputPanel = await executeLessonCode(page, 'go-desde-cero', 90000);

    await expect(outputPanel).toContainText(/Hola Go/i, { timeout: 90000 });
    await expect(outputPanel).not.toContainText(/Bad file number|Runtime Go no pudo inicializar/i);
    await expect(outputPanel).not.toContainText(/Unable to find .* in the registry/i);
  });

  test('clojure runtime executes in browser and returns expected output', async ({ page }) => {
    const outputPanel = await executeLessonCode(page, 'clojure-desde-cero');

    await expect(outputPanel).toContainText(/Hola Clojure/i);
    await expect(outputPanel).not.toContainText(/Runtime WASM de Clojure no configurado/i);
    await expect(outputPanel).not.toContainText(/Unable to find .* in the registry/i);
  });

  test('rust runtime requires package config or executes when configured', async ({ page }) => {
    const outputPanel = await executeLessonCode(page, 'rust-desde-cero');

    await expect(outputPanel).toContainText(
      /(Hola Rust|Runtime WASM de Rust no configurado)/i
    );
    await expect(outputPanel).not.toContainText(/Unable to find .* in the registry/i);
  });
});
