/**
 * E2E Test Utilities
 * Helper functions, test data fixtures, and auth helpers
 */

import { Page, expect } from '@playwright/test';

// ============================================================================
// Test Data Fixtures
// ============================================================================

export const TEST_USER = {
  email: `testuser_e2e_${Date.now()}@example.com`,
  password: 'TestPassword123!',
  name: 'Test User E2E',
};

export const TEST_USER_2 = {
  email: `testuser2_e2e_${Date.now()}@example.com`,
  password: 'TestPassword123!',
  name: 'Test User 2 E2E',
};

export const ADMIN_USER = {
  email: 'emrs94@gmail.com',
  password: 'Xaralit4!',
};

export const TEST_COURSE = {
  title: `Test Course ${Date.now()}`,
  slug: `test-course-${Date.now()}`,
  description: 'This is a test course created by E2E tests',
  order: 999,
};

export const TEST_LESSON = {
  title: `Test Lesson ${Date.now()}`,
  slug: `test-lesson-${Date.now()}`,
  content: '# Test Lesson\n\nThis is a test lesson content.',
  estimatedMinutes: 15,
};

export const TEST_EXERCISE = {
  title: `Test Exercise ${Date.now()}`,
  instructions: 'Write a program that prints "Hello, World!"',
  starterCode: '# Write your code here\n',
  solutionCode: 'print("Hello, World!")',
  validationType: 'exact' as const,
  testCases: { expected: 'Hello, World!' },
  hints: ['Use the print() function'],
  order: 1,
};

// ============================================================================
// Auth Helpers
// ============================================================================

/**
 * Login as a regular user
 */
export async function loginAsUser(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/auth/signin');
  await page.waitForSelector('input#email', { state: 'visible' });
  
  await page.fill('input#email', email);
  await page.fill('input#password', password);
  await page.click('button[type="submit"]');
  
  // Wait for redirect to dashboard
  await page.waitForURL('/dashboard', { timeout: 10000 });
}

/**
 * Login as admin user
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await loginAsUser(page, ADMIN_USER.email, ADMIN_USER.password);
  
  // Verify admin access
  await page.goto('/admin');
  await page.waitForURL('/admin', { timeout: 10000 });
  await expect(page.locator('text=Admin')).toBeVisible();
}

/**
 * Register a new user
 */
export async function registerUser(
  page: Page, 
  name: string, 
  email: string, 
  password: string
): Promise<void> {
  await page.goto('/auth/signup');
  await page.waitForSelector('input#name', { state: 'visible' });
  
  await page.fill('input#name', name);
  await page.fill('input#email', email);
  await page.fill('input#password', password);
  await page.fill('input#confirmPassword', password);
  
  await page.click('button[type="submit"]');
  
  // Wait for redirect to signin
  await page.waitForURL(/.*auth\/signin.*/, { timeout: 10000 });
}

/**
 * Logout current user
 */
export async function logout(page: Page): Promise<void> {
  await page.goto('/dashboard');
  await page.click('text=Cerrar Sesión');
  await page.waitForURL('/', { timeout: 10000 });
}

// ============================================================================
// Navigation Helpers
// ============================================================================

/**
 * Navigate to admin section
 */
export async function navigateToAdmin(page: Page, section?: string): Promise<void> {
  const url = section ? `/admin/${section}` : '/admin';
  await page.goto(url);
  await page.waitForLoadState('networkidle');
}

/**
 * Navigate to dashboard section
 */
export async function navigateToDashboard(page: Page, section?: string): Promise<void> {
  const url = section ? `/dashboard/${section}` : '/dashboard';
  await page.goto(url);
  await page.waitForLoadState('networkidle');
}

/**
 * Navigate to tutorials
 */
export async function navigateToTutorials(page: Page): Promise<void> {
  await page.goto('/tutoriales');
  await page.waitForLoadState('networkidle');
}

/**
 * Navigate to specific course
 */
export async function navigateToCourse(page: Page, courseSlug: string): Promise<void> {
  await page.goto(`/tutoriales/${courseSlug}`);
  await page.waitForLoadState('networkidle');
}

/**
 * Navigate to specific lesson
 */
export async function navigateToLesson(
  page: Page, 
  courseSlug: string, 
  lessonSlug: string
): Promise<void> {
  await page.goto(`/tutoriales/${courseSlug}/${lessonSlug}`);
  await page.waitForLoadState('networkidle');
}

// ============================================================================
// UI Interaction Helpers
// ============================================================================

/**
 * Wait for loading state to complete
 */
export async function waitForLoadingToComplete(page: Page): Promise<void> {
  // Wait for any loading spinners to disappear
  const loadingSpinners = page.locator('[data-testid="loading"], .animate-spin');
  await loadingSpinners.first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
}

/**
 * Wait for toast notification
 */
export async function waitForToast(
  page: Page, 
  type: 'success' | 'error' | 'info' = 'success'
): Promise<void> {
  const toastSelector = `[data-testid="toast-${type}"]`;
  await page.waitForSelector(toastSelector, { state: 'visible', timeout: 10000 });
}

/**
 * Take screenshot with descriptive name
 */
export async function takeScreenshot(
  page: Page, 
  name: string, 
  fullPage: boolean = true
): Promise<void> {
  await page.screenshot({ 
    path: `./test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage 
  });
}

/**
 * Fill form field with retry logic
 */
export async function fillField(
  page: Page, 
  selector: string, 
  value: string, 
  options?: { clear?: boolean }
): Promise<void> {
  const field = page.locator(selector).first();
  await field.waitFor({ state: 'visible' });
  
  if (options?.clear !== false) {
    await field.fill('');
  }
  
  await field.fill(value);
}

/**
 * Click button with wait for navigation
 */
export async function clickAndWait(
  page: Page, 
  selector: string, 
  waitForNavigation: boolean = true
): Promise<void> {
  if (waitForNavigation) {
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.click(selector),
    ]);
  } else {
    await page.click(selector);
  }
}

/**
 * Submit form and wait for response
 */
export async function submitForm(page: Page, formSelector: string = 'form'): Promise<void> {
  const submitButton = page.locator(`${formSelector} button[type="submit"]`).first();
  await submitButton.click();
}

// ============================================================================
// Admin Content Creation Helpers
// ============================================================================

/**
 * Create a new course via admin UI
 */
export async function createCourseViaAdmin(
  page: Page,
  courseData: typeof TEST_COURSE
): Promise<void> {
  await navigateToAdmin(page, 'cursos/nuevo');
  
  await page.fill('input[name="title"]', courseData.title);
  await page.fill('input[name="slug"]', courseData.slug);
  await page.fill('textarea[name="description"]', courseData.description);
  await page.fill('input[name="order"]', String(courseData.order));
  
  await page.click('button[type="submit"]');
  await page.waitForURL('/admin/cursos', { timeout: 10000 });
}

/**
 * Toggle course publish status
 */
export async function toggleCoursePublish(page: Page, courseId: string): Promise<void> {
  // This would need to be implemented based on actual UI
  // Placeholder for the pattern
  await navigateToAdmin(page, 'cursos');
  const publishToggle = page.locator(`[data-course-id="${courseId}"] [data-testid="publish-toggle"]`);
  await publishToggle.click();
}

// ============================================================================
// Mobile Helpers
// ============================================================================

/**
 * Set mobile viewport
 */
export async function setMobileViewport(page: Page): Promise<void> {
  await page.setViewportSize({ width: 375, height: 667 });
}

/**
 * Set tablet viewport
 */
export async function setTabletViewport(page: Page): Promise<void> {
  await page.setViewportSize({ width: 768, height: 1024 });
}

/**
 * Set desktop viewport
 */
export async function setDesktopViewport(page: Page): Promise<void> {
  await page.setViewportSize({ width: 1280, height: 720 });
}

/**
 * Open mobile menu
 */
export async function openMobileMenu(page: Page): Promise<void> {
  const menuButton = page.locator('button[aria-label="Open menu"], button:has-text("Menu")').first();
  await menuButton.click();
  await page.waitForTimeout(300); // Wait for animation
}

/**
 * Close mobile menu
 */
export async function closeMobileMenu(page: Page): Promise<void> {
  const closeButton = page.locator('button[aria-label="Close menu"], button:has-text("Close")').first();
  await closeButton.click();
  await page.waitForTimeout(300); // Wait for animation
}

// ============================================================================
// Assertion Helpers
// ============================================================================

/**
 * Assert user is on dashboard
 */
export async function assertIsOnDashboard(page: Page): Promise<void> {
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('text=Dashboard')).toBeVisible();
}

/**
 * Assert user is on login page
 */
export async function assertIsOnLogin(page: Page): Promise<void> {
  await expect(page).toHaveURL(/.*auth\/signin.*/);
  await expect(page.locator('h1')).toContainText('Bienvenido de nuevo');
}

/**
 * Assert error message is displayed
 */
export async function assertErrorMessage(page: Page, message: string): Promise<void> {
  await expect(page.locator(`text=${message}`).first()).toBeVisible();
}

/**
 * Assert success message is displayed
 */
export async function assertSuccessMessage(page: Page, message: string): Promise<void> {
  await expect(page.locator(`text=${message}`).first()).toBeVisible();
}

/**
 * Assert element exists and is visible
 */
export async function assertElementVisible(
  page: Page, 
  selector: string
): Promise<void> {
  const element = page.locator(selector).first();
  await expect(element).toBeVisible();
}
