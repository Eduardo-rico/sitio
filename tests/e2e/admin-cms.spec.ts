import { test, expect } from '@playwright/test';

const ADMIN_CREDENTIALS = {
  email: 'Charalo123',
  password: 'Charalo123'
};

test.describe('Admin CMS - Content Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/auth/signin');
    await page.fill('input#email', ADMIN_CREDENTIALS.email);
    await page.fill('input#password', ADMIN_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
  });

  test('should create a new course', async ({ page }) => {
    await page.goto('/admin/cursos/nuevo');
    
    // Fill course form
    await page.fill('input[name="title"]', 'Curso de Prueba E2E');
    await page.fill('textarea[name="description"]', 'Descripción del curso de prueba');
    await page.fill('input[name="order"]', '99');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to courses list
    await expect(page).toHaveURL('/admin/cursos', { timeout: 5000 });
    
    // Should show success toast
    await expect(page.locator('text=Curso creado exitosamente')).toBeVisible();
    
    // Verify course appears in list
    await expect(page.locator('text=Curso de Prueba E2E')).toBeVisible();
  });

  test('should edit a course', async ({ page }) => {
    // Navigate to first course
    await page.goto('/admin/cursos');
    await page.click('text=Editar >> nth=0');
    
    // Edit title
    const titleInput = page.locator('input[name="title"]');
    await titleInput.fill('');
    await titleInput.fill('Curso Editado E2E');
    
    // Save changes
    await page.click('button[type="submit"]');
    
    // Should show success message
    await expect(page.locator('text=Curso actualizado')).toBeVisible();
  });

  test('should create a lesson', async ({ page }) => {
    await page.goto('/admin/lecciones/nueva');
    
    // Select course
    await page.selectOption('select[name="courseId"]', { index: 0 });
    
    // Fill lesson data
    await page.fill('input[name="title"]', 'Lección de Prueba E2E');
    await page.fill('input[name="slug"]', 'leccion-prueba-e2e');
    await page.fill('textarea[name="content"]', '# Contenido de Prueba\n\nEste es el contenido de la lección.');
    await page.fill('input[name="estimatedMinutes"]', '15');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should redirect to lessons list
    await expect(page).toHaveURL('/admin/lecciones', { timeout: 5000 });
    await expect(page.locator('text=Lección de Prueba E2E')).toBeVisible();
  });

  test('should create an exercise', async ({ page }) => {
    await page.goto('/admin/ejercicios/nuevo');
    
    // Select lesson
    await page.selectOption('select[name="lessonId"]', { index: 0 });
    
    // Fill exercise data
    await page.fill('input[name="title"]', 'Ejercicio de Prueba E2E');
    await page.fill('textarea[name="instructions"]', 'Escribe un programa que imprima "Hola"');
    await page.fill('textarea[name="starterCode"]', '# Tu código aquí\nprint()');
    await page.fill('textarea[name="solutionCode"]', 'print("Hola")');
    
    // Select validation type
    await page.selectOption('select[name="validationType"]', 'exact');
    
    // Add test case
    await page.click('text=Añadir caso de prueba');
    await page.fill('input[name="testCases.0.expected"]', 'Hola');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should redirect
    await expect(page).toHaveURL('/admin/ejercicios', { timeout: 5000 });
    await expect(page.locator('text=Ejercicio de Prueba E2E')).toBeVisible();
  });

  test('should publish and unpublish a course', async ({ page }) => {
    await page.goto('/admin/cursos');
    
    // Find first course and toggle publish
    const publishButton = page.locator('button[title="Publicar"]').first();
    
    if (await publishButton.isVisible().catch(() => false)) {
      await publishButton.click();
      await expect(page.locator('text=Curso publicado')).toBeVisible();
    } else {
      // Unpublish if already published
      const unpublishButton = page.locator('button[title="Despublicar"]').first();
      await unpublishButton.click();
      await expect(page.locator('text=Curso despublicado')).toBeVisible();
    }
  });
});
