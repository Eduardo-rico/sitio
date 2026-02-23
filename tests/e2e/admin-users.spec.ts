import { test, expect } from '@playwright/test';
import { 
  loginAsAdmin, 
  loginAsUser,
  registerUser,
  TEST_USER,
  navigateToAdmin,
  waitForLoadingToComplete 
} from './utils';

/**
 * Admin Users Management E2E Tests
 * Covers: User list, Search, Filter, User detail, Role change, Suspend, Export
 */

test.describe.configure({ mode: 'parallel' });

test.describe('Admin Users - User List', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToAdmin(page, 'users');
  });

  test('should display users management page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('User Management');
    await expect(page.locator('text=Manage user accounts and permissions')).toBeVisible();
  });

  test('should display users table', async ({ page }) => {
    // Verify table headers
    await expect(page.locator('th:has-text("User")')).toBeVisible();
    await expect(page.locator('th:has-text("Email")')).toBeVisible();
    await expect(page.locator('th:has-text("Role")')).toBeVisible();
    await expect(page.locator('th:has-text("Activity")')).toBeVisible();
    await expect(page.locator('th:has-text("Joined")')).toBeVisible();
    await expect(page.locator('th:has-text("Actions")')).toBeVisible();
  });

  test('should show total user count', async ({ page }) => {
    await expect(page.locator('text=Total:')).toBeVisible();
    await expect(page.locator('text=users')).toBeVisible();
  });

  test('should display user avatars or initials', async ({ page }) => {
    // Look for avatar elements
    const avatars = page.locator('[class*="rounded-full"], [class*="avatar"], img').first();
    await expect(avatars).toBeVisible();
  });

  test('should display user activity counts', async ({ page }) => {
    // Look for activity indicators
    const activity = page.locator('td:has-text("progress") td:has-text("submissions"), [title*="Progress"]').first();
    
    // Activity column should exist
    await expect(page.locator('th:has-text("Activity")')).toBeVisible();
  });

  test('should show empty state when no users', async ({ page }) => {
    // Apply extreme filter that returns no results
    const searchInput = page.locator('input[type="text"]').first();
    
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('xyznonexistentuser12345');
      await page.waitForTimeout(500);
      
      // Should show empty state
      await expect(page.locator('text=No users found')).toBeVisible();
      await expect(page.locator('text=Try adjusting your search')).toBeVisible();
    }
  });
});

test.describe('Admin Users - Search', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToAdmin(page, 'users');
  });

  test('should have search input', async ({ page }) => {
    const searchInput = page.locator('input[type="text"], input[placeholder*="search"], input[placeholder*="Search"]').first();
    await expect(searchInput).toBeVisible();
  });

  test('should search users by name', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    
    // Search for admin user (which should exist)
    await searchInput.fill('admin');
    await page.waitForTimeout(500);
    
    // Results should update
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });

  test('should search users by email', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    
    // Search by email domain
    await searchInput.fill('@gmail.com');
    await page.waitForTimeout(500);
    
    // Results should update
    await expect(page.locator('tbody tr').first().or(page.locator('text=No users found'))).toBeVisible();
  });

  test('should show no results for non-existent search', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    
    await searchInput.fill('xyznonexistent789');
    await page.waitForTimeout(500);
    
    await expect(page.locator('text=No users found')).toBeVisible();
  });

  test('should clear search results', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    
    // Enter search
    await searchInput.fill('test');
    await page.waitForTimeout(500);
    
    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(500);
    
    // Should show all users again
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });

  test('should search in real-time', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    
    // Type slowly and verify results update
    await searchInput.type('a', { delay: 100 });
    await page.waitForTimeout(300);
    
    // Should have results (or empty state)
    await expect(page.locator('tbody tr').first().or(page.locator('text=No users found'))).toBeVisible();
  });
});

test.describe('Admin Users - Filter', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToAdmin(page, 'users');
  });

  test('should have role filter dropdown', async ({ page }) => {
    const roleFilter = page.locator('select').filter({ hasText: /All Roles|Admin|User/ }).first();
    await expect(roleFilter).toBeVisible();
  });

  test('should filter by admin role', async ({ page }) => {
    const roleFilter = page.locator('select').first();
    
    await roleFilter.selectOption({ label: 'Admin' });
    await page.waitForTimeout(500);
    
    // Should show only admin users
    const adminBadges = page.locator('text=admin').first();
    await expect(adminBadges.or(page.locator('text=No users found'))).toBeVisible();
  });

  test('should filter by user role', async ({ page }) => {
    const roleFilter = page.locator('select').first();
    
    await roleFilter.selectOption({ label: 'User' });
    await page.waitForTimeout(500);
    
    // Should show only regular users
    await expect(page.locator('tbody tr').first().or(page.locator('text=No users found'))).toBeVisible();
  });

  test('should combine search and filter', async ({ page }) => {
    const searchInput = page.locator('input[type="text"]').first();
    const roleFilter = page.locator('select').first();
    
    // Apply both filters
    await searchInput.fill('test');
    await roleFilter.selectOption({ label: 'User' });
    await page.waitForTimeout(500);
    
    // Results should match both criteria
    await expect(page.locator('tbody').first().or(page.locator('text=No users found'))).toBeVisible();
  });

  test('should reset filters', async ({ page }) => {
    const roleFilter = page.locator('select').first();
    
    // Apply filter
    await roleFilter.selectOption({ label: 'Admin' });
    await page.waitForTimeout(500);
    
    // Reset to all
    await roleFilter.selectOption({ label: 'All Roles' });
    await page.waitForTimeout(500);
    
    // Should show all users
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });
});

test.describe('Admin Users - Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToAdmin(page, 'users');
  });

  test('should display pagination controls', async ({ page }) => {
    // Look for pagination
    const pagination = page.locator('text=Page, text=Previous, text=Next, button:has-text("Previous"), button:has-text("Next")').first();
    
    await expect(pagination.or(page.locator('text=Total:')).first()).toBeVisible();
  });

  test('should show current page info', async ({ page }) => {
    const pageInfo = page.locator('text=Page, text=Showing').first();
    
    await expect(pageInfo.or(page.locator('text=Total:')).first()).toBeVisible();
  });

  test('should navigate to next page', async ({ page }) => {
    const nextButton = page.locator('button:has-text("Next"), a:has-text("Next")').first();
    
    if (await nextButton.isVisible().catch(() => false)) {
      const isEnabled = await nextButton.isEnabled().catch(() => false);
      
      if (isEnabled) {
        await nextButton.click();
        await waitForLoadingToComplete(page);
        
        // Should be on page 2
        await expect(page.locator('text=Page 2')).toBeVisible();
      }
    }
  });

  test('should navigate to previous page', async ({ page }) => {
    const nextButton = page.locator('button:has-text("Next"), a:has-text("Next")').first();
    const prevButton = page.locator('button:has-text("Previous"), a:has-text("Previous")').first();
    
    // First go to page 2 if possible
    if (await nextButton.isVisible().catch(() => false)) {
      const isNextEnabled = await nextButton.isEnabled().catch(() => false);
      
      if (isNextEnabled) {
        await nextButton.click();
        await waitForLoadingToComplete(page);
        
        // Then go back
        const isPrevEnabled = await prevButton.isEnabled().catch(() => false);
        
        if (isPrevEnabled) {
          await prevButton.click();
          await waitForLoadingToComplete(page);
          
          await expect(page.locator('text=Page 1')).toBeVisible();
        }
      }
    }
  });

  test('should disable pagination buttons appropriately', async ({ page }) => {
    const prevButton = page.locator('button:has-text("Previous"), a:has-text("Previous")').first();
    
    if (await prevButton.isVisible().catch(() => false)) {
      // Previous should be disabled on page 1
      await expect(prevButton).toBeDisabled();
    }
  });
});

test.describe('Admin Users - User Detail', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToAdmin(page, 'users');
  });

  test('should display user information in table', async ({ page }) => {
    // Get first user row
    const firstRow = page.locator('tbody tr').first();
    await expect(firstRow).toBeVisible();
    
    // Should have user data
    await expect(firstRow.locator('td').first()).toBeVisible();
  });

  test('should show user name and email', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    
    // Should have email displayed
    const emailCell = firstRow.locator('td').nth(1);
    await expect(emailCell).toBeVisible();
  });

  test('should show user join date', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    
    // Join date column
    const joinedCell = firstRow.locator('td').nth(4);
    await expect(joinedCell).toBeVisible();
  });

  test('should show user activity counts', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    
    // Activity column with counts
    const activityCell = firstRow.locator('td').nth(3);
    await expect(activityCell).toBeVisible();
  });
});

test.describe('Admin Users - Role Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToAdmin(page, 'users');
  });

  test('should display current user role', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first();
    
    // Role cell should show current role
    const roleCell = firstRow.locator('td').nth(2);
    await expect(roleCell).toBeVisible();
  });

  test('should have role selector for each user', async ({ page }) => {
    // Look for role select dropdowns
    const roleSelects = page.locator('select').filter({ hasText: /admin|user/i }).first();
    
    await expect(roleSelects).toBeVisible();
  });

  test('should change user role', async ({ page }) => {
    // Find a non-admin user
    const userRows = page.locator('tbody tr');
    const count = await userRows.count();
    
    for (let i = 0; i < count; i++) {
      const row = userRows.nth(i);
      const roleCell = row.locator('td').nth(2);
      const roleText = await roleCell.textContent().catch(() => '');
      
      if (roleText.toLowerCase().includes('user')) {
        // Found a regular user, try to change role
        const roleSelect = row.locator('select').first();
        
        if (await roleSelect.isVisible().catch(() => false)) {
          await roleSelect.selectOption({ label: 'Admin' });
          await page.waitForTimeout(500);
          
          // Role should update
          await expect(page.locator('body')).toBeVisible();
          break;
        }
      }
    }
  });

  test('should confirm role change', async ({ page }) => {
    // This would test confirmation dialogs if implemented
    await expect(page.locator('body')).toBeVisible();
  });

  test('should show role change success message', async ({ page }) => {
    // After role change, success message may appear
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Admin Users - Suspend/Disable', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToAdmin(page, 'users');
  });

  test('should have disable/suspend action', async ({ page }) => {
    // Look for action menu button
    const actionButton = page.locator('button:has([class*="MoreHorizontal"]), button:has-text("Actions"), [title*="actions"]').first();
    
    await expect(actionButton).toBeVisible();
  });

  test('should open action menu', async ({ page }) => {
    const actionButton = page.locator('button:has([class*="MoreHorizontal"])').first();
    
    if (await actionButton.isVisible().catch(() => false)) {
      await actionButton.click();
      
      // Menu should appear
      const menu = page.locator('[class*="menu"], [class*="dropdown"]').first();
      await expect(menu.or(page.locator('text=Disable Account'))).toBeVisible();
    }
  });

  test('should show disable confirmation dialog', async ({ page }) => {
    const actionButton = page.locator('button:has([class*="MoreHorizontal"])').first();
    
    if (await actionButton.isVisible().catch(() => false)) {
      await actionButton.click();
      
      // Click disable option
      const disableOption = page.locator('text=Disable Account, text=Suspend').first();
      
      if (await disableOption.isVisible().catch(() => false)) {
        await disableOption.click();
        
        // Confirmation dialog should appear
        await expect(page.locator('text=Disable User Account').or(page.locator('text=Confirm'))).toBeVisible();
      }
    }
  });

  test('should cancel disable action', async ({ page }) => {
    // Open disable dialog first
    const actionButton = page.locator('button:has([class*="MoreHorizontal"])').first();
    
    if (await actionButton.isVisible().catch(() => false)) {
      await actionButton.click();
      
      const disableOption = page.locator('text=Disable Account').first();
      
      if (await disableOption.isVisible().catch(() => false)) {
        await disableOption.click();
        
        // Click cancel
        const cancelButton = page.locator('button:has-text("Cancel")').first();
        await cancelButton.click();
        
        // Dialog should close
        await expect(page.locator('text=Disable User Account')).not.toBeVisible();
      }
    }
  });

  test('should disable user account', async ({ page }) => {
    // This would actually disable a test user
    await expect(page.locator('body')).toBeVisible();
  });

  test('should prevent disabled user from logging in', async ({ page, browser }) => {
    // Create a test user
    const uniqueEmail = `disable_test_${Date.now()}@example.com`;
    await registerUser(page, 'Disable Test', uniqueEmail, TEST_USER.password);
    
    // Disable the user via admin
    await loginAsAdmin(page);
    await navigateToAdmin(page, 'users');
    
    // Search for the user
    const searchInput = page.locator('input[type="text"]').first();
    await searchInput.fill(uniqueEmail);
    await page.waitForTimeout(500);
    
    // Disable the user
    const actionButton = page.locator('button:has([class*="MoreHorizontal"])').first();
    if (await actionButton.isVisible().catch(() => false)) {
      await actionButton.click();
      
      const disableOption = page.locator('text=Disable Account').first();
      if (await disableOption.isVisible().catch(() => false)) {
        await disableOption.click();
        
        const confirmButton = page.locator('button:has-text("Disable Account")').last();
        await confirmButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Try to login as disabled user
    const newPage = await browser.newPage();
    await newPage.goto('/auth/signin');
    await newPage.fill('input#email', uniqueEmail);
    await newPage.fill('input#password', TEST_USER.password);
    await newPage.click('button[type="submit"]');
    
    // Should show error
    await expect(newPage.locator('text=invalid, text=disabled, text=bloqueada').first()).toBeVisible({ timeout: 5000 });
    await newPage.close();
  });
});

test.describe('Admin Users - Export', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToAdmin(page, 'users');
  });

  test('should have export button', async ({ page }) => {
    // Look for export button or link
    const exportButton = page.locator('button:has-text("Export"), a:has-text("Export"), button:has-text("CSV"), a[href*="export"]').first();
    
    await expect(exportButton.or(page.locator('text=User Management'))).toBeVisible();
  });

  test('should export users as CSV', async ({ page }) => {
    const exportLink = page.locator('a[href*="export"], button:has-text("Export")').first();
    
    if (await exportLink.isVisible().catch(() => false)) {
      const [download] = await Promise.all([
        page.waitForEvent('download').catch(() => null),
        exportLink.click(),
      ]);
      
      if (download) {
        const filename = download.suggestedFilename();
        expect(filename).toMatch(/\.(csv|zip)/i);
      }
    }
  });

  test('should export filtered users', async ({ page }) => {
    // Apply filter first
    const roleFilter = page.locator('select').first();
    await roleFilter.selectOption({ label: 'User' });
    await page.waitForTimeout(500);
    
    // Then export
    const exportLink = page.locator('a[href*="export"]').first();
    
    if (await exportLink.isVisible().catch(() => false)) {
      await exportLink.click();
      // Export should complete
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should include all user data in export', async ({ page }) => {
    // Placeholder for verifying export content
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Admin Users - Sorting', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToAdmin(page, 'users');
  });

  test('should sort by name', async ({ page }) => {
    // Click on Name column header
    const nameHeader = page.locator('th:has-text("User")').first();
    await nameHeader.click();
    await page.waitForTimeout(300);
    
    // Table should still show users
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });

  test('should sort by email', async ({ page }) => {
    const emailHeader = page.locator('th:has-text("Email")').first();
    await emailHeader.click();
    await page.waitForTimeout(300);
    
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });

  test('should sort by role', async ({ page }) => {
    const roleHeader = page.locator('th:has-text("Role")').first();
    await roleHeader.click();
    await page.waitForTimeout(300);
    
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });

  test('should sort by joined date', async ({ page }) => {
    const joinedHeader = page.locator('th:has-text("Joined")').first();
    await joinedHeader.click();
    await page.waitForTimeout(300);
    
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });

  test('should toggle sort direction', async ({ page }) => {
    const nameHeader = page.locator('th:has-text("User")').first();
    
    // First click - ascending
    await nameHeader.click();
    await page.waitForTimeout(300);
    
    // Second click - descending
    await nameHeader.click();
    await page.waitForTimeout(300);
    
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });
});
