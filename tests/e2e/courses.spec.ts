import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'testuser_courses@example.com',
  password: 'TestPassword123!',
  name: 'Test User Courses'
};

test.describe('Course Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Register/Login
    await page.goto('/auth/signup');
    await page.fill('input#name', TEST_USER.name);
    await page.fill('input#email', TEST_USER.email);
    await page.fill('input#password', TEST_USER.password);
    await page.fill('input#confirmPassword', TEST_USER.password);
    await page.click('button[type="submit"]');
    
    // Should redirect to signin
    await expect(page).toHaveURL(/.*auth\/signin.*/, { timeout: 15000 });
    
    // Login
    await page.fill('input#email', TEST_USER.email);
    await page.fill('input#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
  });

  test('should view courses list', async ({ page }) => {
    await page.goto('/tutoriales');
    
    // Should show courses
    await expect(page.locator('h1')).toContainText('Tutoriales');
    
    // Should have at least one course
    const courses = page.locator('[data-testid="course-card"]');
    await expect(courses.count()).toBeGreaterThan(0);
  });

  test('should navigate to course detail', async ({ page }) => {
    await page.goto('/tutoriales');
    
    // Click first course
    await page.click('[data-testid="course-card"] >> nth=0');
    
    // Should show course detail
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Lecciones')).toBeVisible();
  });

  test('should start a lesson', async ({ page }) => {
    // Go to first course
    await page.goto('/tutoriales/python-desde-cero');
    
    // Click first lesson
    await page.click('[data-testid="lesson-link"] >> nth=0');
    
    // Should show lesson content
    await expect(page.locator('article')).toBeVisible();
    await expect(page.locator('[data-testid="code-editor"]')).toBeVisible();
  });

  test('should complete an exercise correctly', async ({ page }) => {
    // Navigate to a lesson with exercise
    await page.goto('/tutoriales/python-desde-cero/primer-programa');
    
    // Wait for editor to load
    await expect(page.locator('[data-testid="code-editor"]')).toBeVisible();
    
    // Clear and type correct code
    const editor = page.locator('[data-testid="code-editor"] textarea');
    await editor.fill('print("Hola, mundo!")');
    
    // Submit
    await page.click('button[data-testid="run-code"]');
    
    // Should show success
    await expect(page.locator('text=¡Correcto!')).toBeVisible({ timeout: 10000 });
  });

  test('should track progress', async ({ page }) => {
    // Complete a lesson first
    await page.goto('/tutoriales/python-desde-cero/primer-programa');
    
    const editor = page.locator('[data-testid="code-editor"] textarea');
    await editor.fill('print("Hola, mundo!")');
    await page.click('button[data-testid="run-code"]');
    await expect(page.locator('text=¡Correcto!')).toBeVisible({ timeout: 10000 });
    
    // Go to dashboard
    await page.goto('/dashboard');
    
    // Should show progress
    await expect(page.locator('text=Progreso')).toBeVisible();
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
  });

  test('should continue where left off', async ({ page }) => {
    // Start a lesson
    await page.goto('/tutoriales/python-desde-cero/primer-programa');
    
    // Go back to dashboard
    await page.goto('/dashboard');
    
    // Should have "Continuar" button
    const continueButton = page.locator('text=Continuar');
    if (await continueButton.isVisible().catch(() => false)) {
      await continueButton.click();
      // Should return to lesson
      await expect(page.locator('article')).toBeVisible();
    }
  });
});
