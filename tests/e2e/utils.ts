import { Page } from '@playwright/test';

export const TEST_USERS = {
  admin: {
    email: 'Charalo123',
    password: 'Charalo123'
  },
  regular: {
    email: 'testuser@example.com',
    password: 'TestPassword123!',
    name: 'Test User'
  }
};

export async function loginAsAdmin(page: Page) {
  await page.goto('/auth/signin');
  await page.fill('input#email', TEST_USERS.admin.email);
  await page.fill('input#password', TEST_USERS.admin.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard', { timeout: 5000 });
}

export async function loginAsUser(page: Page) {
  await page.goto('/auth/signin');
  await page.fill('input#email', TEST_USERS.regular.email);
  await page.fill('input#password', TEST_USERS.regular.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard', { timeout: 5000 });
}

export async function registerUser(page: Page, email: string, password: string, name: string) {
  await page.goto('/auth/signup');
  await page.fill('input#name', name);
  await page.fill('input#email', email);
  await page.fill('input#password', password);
  await page.fill('input#confirmPassword', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/.*auth\/signin.*/, { timeout: 5000 });
}

export async function logout(page: Page) {
  await page.click('text=Cerrar sesión');
  await page.waitForURL('/', { timeout: 5000 });
}

export function generateTestEmail() {
  return `test_${Date.now()}@example.com`;
}

export async function waitForToast(page: Page, message: string) {
  await page.waitForSelector(`text=${message}`, { timeout: 5000 });
}
