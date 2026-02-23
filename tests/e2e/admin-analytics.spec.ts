import { test, expect } from '@playwright/test';
import { loginAsAdmin } from './utils';

test.describe('Admin Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');
  });

  test('renders admin analytics overview and key widgets', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
    await expect(page.getByText('Analytics Overview')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Analytics Dashboard' })).toBeVisible();
    await expect(page.getByText('User Growth')).toBeVisible();
    await expect(page.getByText('Course Popularity')).toBeVisible();
    await expect(page.getByText('Completion Rates')).toBeVisible();
  });

  test('supports changing analytics date range', async ({ page }) => {
    await page.getByRole('button', { name: /30 Days|Today|7 Days|3 Months|Year/ }).click();
    await page.getByRole('button', { name: '7 Days' }).click();
    await expect(page.getByRole('button', { name: /7 Days/ })).toBeVisible();
  });
});
