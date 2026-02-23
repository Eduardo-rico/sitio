import { expect, Page } from '@playwright/test';

export const ADMIN_USER = {
  email: 'admin@example.com',
  password: 'Charalo123',
};

export interface E2ETestUser {
  name: string;
  email: string;
  password: string;
}

export function createTestUser(prefix = 'e2e'): E2ETestUser {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    name: `${prefix}-user-${suffix}`,
    email: `${prefix}-${suffix}@example.com`,
    password: 'TestPassword123!',
  };
}

export async function registerUser(page: Page, user: E2ETestUser): Promise<void> {
  await page.goto('/auth/signup');
  await expect(page).toHaveURL(/\/auth\/signup/);

  await page.fill('input#name', user.name);
  await page.fill('input#email', user.email);
  await page.fill('input#password', user.password);
  await page.fill('input#confirmPassword', user.password);
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/\/auth\/signin/, { timeout: 30000 });
}

export async function loginUser(
  page: Page,
  credentials: Pick<E2ETestUser, 'email' | 'password'>,
  expectedUrl: RegExp = /\/dashboard/
): Promise<void> {
  await page.goto('/auth/signin');
  await expect(page).toHaveURL(/\/auth\/signin/);

  // If session is already active, go directly to dashboard.
  const alreadySignedIn = page.getByRole('heading', { name: /Ya has iniciado sesión/i });
  if (await alreadySignedIn.isVisible().catch(() => false)) {
    await page.getByRole('link', { name: /Ir al Dashboard/i }).click();
    await expect(page).toHaveURL(expectedUrl, { timeout: 30000 });
    return;
  }

  await page.fill('input#email', credentials.email);
  await page.fill('input#password', credentials.password);
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(expectedUrl, { timeout: 30000 });
}

export async function loginAsAdmin(page: Page): Promise<void> {
  await loginUser(page, ADMIN_USER);
}

export async function logoutFromDashboard(page: Page): Promise<void> {
  await page.getByRole('button', { name: /Cerrar Sesión/i }).click();
  await expect(page).toHaveURL('/');
}
