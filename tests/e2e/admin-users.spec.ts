import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './utils';

test.describe('Admin User Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/usuarios', { waitUntil: 'domcontentloaded', timeout: 45000 });
  });

  test('renders user administration dashboard', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /User Management|Usuarios/i })).toBeVisible();
    await expect(page.getByText(/Total Users|Total usuarios/i)).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('supports searching users in the admin table', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="Buscar"]').first();
    await searchInput.fill('admin@example.com');
    await expect(page.locator('table').getByText('admin@example.com').first()).toBeVisible();
  });
});
