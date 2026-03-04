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
  // Prefer API registration for deterministic setup across E2E suites.
  const response = await page.request.post('/api/auth/register', {
    data: {
      name: user.name,
      email: user.email,
      password: user.password,
    },
  });

  if (response.status() !== 201) {
    const body = await response.text();
    throw new Error(`Failed to register E2E user (${response.status()}): ${body}`);
  }
}

export async function loginUser(
  page: Page,
  credentials: Pick<E2ETestUser, 'email' | 'password'>,
  expectedUrl: RegExp = /\/dashboard/
): Promise<void> {
  await page.goto('/auth/signin');
  await expect(page).toHaveURL(/\/auth\/signin/);

  const loadingText = page.getByText('Cargando...');
  const alreadySignedIn = page.getByRole('heading', { name: /Ya has iniciado sesión/i });
  const emailInput = page.locator('input#email');

  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (await alreadySignedIn.isVisible().catch(() => false)) {
      break;
    }

    if (await emailInput.isVisible().catch(() => false)) {
      break;
    }

    if (await loadingText.isVisible().catch(() => false)) {
      if (attempt === 1) {
        await page.reload();
        await expect(page).toHaveURL(/\/auth\/signin/);
      } else {
        await page.waitForTimeout(800);
      }
    } else {
      await page.waitForTimeout(300);
    }
  }

  // If session is already active, go directly to dashboard.
  if (await alreadySignedIn.isVisible().catch(() => false)) {
    await page.getByRole('link', { name: /Ir al Dashboard/i }).click();
    await expect(page).toHaveURL(expectedUrl, { timeout: 30000 });
    return;
  }

  await expect(emailInput).toBeVisible({ timeout: 30000 });
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
