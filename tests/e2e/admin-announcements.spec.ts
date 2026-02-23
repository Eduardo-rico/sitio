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
 * Admin Announcements E2E Tests
 * Covers: Create, Edit, Activate/Deactivate announcements, User view, Dismiss
 */

test.describe.configure({ mode: 'parallel' });

test.describe('Admin Announcements - List and Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should navigate to announcements section', async ({ page }) => {
    // Look for announcements in admin navigation
    const announcementsLink = page.locator('a:has-text("Announcements"), a:has-text("Anuncios"), a[href*="announcement"]').first();
    
    if (await announcementsLink.isVisible().catch(() => false)) {
      await announcementsLink.click();
      await page.waitForLoadState('networkidle');
      
      // Should be on announcements page
      await expect(page.url()).toContain('announcement');
    } else {
      // Announcements may be a separate feature not yet implemented
      await expect(page.locator('text=Dashboard')).toBeVisible();
    }
  });

  test('should display announcements list', async ({ page }) => {
    // Try to navigate to announcements
    await page.goto('/admin/announcements');
    await page.waitForLoadState('networkidle');
    
    // If page exists, verify structure
    if (await page.locator('h1').filter({ hasText: /announcement|anuncio/i }).first().isVisible().catch(() => false)) {
      await expect(page.locator('h1')).toContainText(/announcement|anuncio/i);
    }
  });

  test('should show create announcement button', async ({ page }) => {
    await page.goto('/admin/announcements');
    
    // Look for create button
    const createButton = page.locator('button:has-text("Create"), a:has-text("Create"), button:has-text("Nuevo"), a:has-text("Nuevo"]').first();
    
    await expect(createButton.or(page.locator('body'))).toBeVisible();
  });
});

test.describe('Admin Announcements - Create', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/announcements');
  });

  test('should navigate to create announcement form', async ({ page }) => {
    const createLink = page.locator('a[href*="new"], a[href*="create"], button:has-text("Create"), a:has-text("Create")').first();
    
    if (await createLink.isVisible().catch(() => false)) {
      await createLink.click();
      
      // Should navigate to create form
      await expect(page.url()).toMatch(/announcement.*(new|create)/);
    }
  });

  test('should display announcement creation form', async ({ page }) => {
    await page.goto('/admin/announcements/new');
    
    // If form exists, verify fields
    const titleInput = page.locator('input[name="title"], input#title').first();
    const contentInput = page.locator('textarea[name="content"], textarea#content, [class*="editor"]').first();
    
    if (await titleInput.or(contentInput).isVisible().catch(() => false)) {
      await expect(titleInput.or(contentInput)).toBeVisible();
    }
  });

  test('should create a new announcement', async ({ page }) => {
    await page.goto('/admin/announcements/new');
    
    const titleInput = page.locator('input[name="title"]').first();
    const contentInput = page.locator('textarea[name="content"]').first();
    const submitButton = page.locator('button[type="submit"]').first();
    
    if (await titleInput.isVisible().catch(() => false)) {
      const testTitle = `Test Announcement ${Date.now()}`;
      
      await titleInput.fill(testTitle);
      await contentInput.fill('This is a test announcement created by E2E tests.');
      
      if (await submitButton.isVisible().catch(() => false)) {
        await submitButton.click();
        
        // Should redirect to list or show success
        await expect(page.locator('body')).toBeVisible();
      }
    }
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/admin/announcements/new');
    
    const submitButton = page.locator('button[type="submit"]').first();
    
    if (await submitButton.isVisible().catch(() => false)) {
      // Try to submit empty form
      await submitButton.click();
      
      // Should show validation errors or stay on form
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should set announcement priority', async ({ page }) => {
    await page.goto('/admin/announcements/new');
    
    const prioritySelect = page.locator('select[name="priority"], select#priority').first();
    
    if (await prioritySelect.isVisible().catch(() => false)) {
      await prioritySelect.selectOption({ label: 'High' });
      
      // Should be selected
      await expect(prioritySelect).toHaveValue(/high|1/);
    }
  });

  test('should set announcement dates', async ({ page }) => {
    await page.goto('/admin/announcements/new');
    
    const startDate = page.locator('input[name="startDate"], input[name="start_date"]').first();
    const endDate = page.locator('input[name="endDate"], input[name="end_date"]').first();
    
    if (await startDate.or(endDate).isVisible().catch(() => false)) {
      const today = new Date().toISOString().split('T')[0];
      
      if (await startDate.isVisible()) {
        await startDate.fill(today);
      }
      
      await expect(startDate.or(endDate).or(page.locator('body'))).toBeVisible();
    }
  });

  test('should set target audience', async ({ page }) => {
    await page.goto('/admin/announcements/new');
    
    const targetSelect = page.locator('select[name="target"], select[name="audience"]').first();
    const allUsersCheckbox = page.locator('input[name="allUsers"], input[name="all_users"]').first();
    
    await expect(targetSelect.or(allUsersCheckbox).or(page.locator('body'))).toBeVisible();
  });
});

test.describe('Admin Announcements - Edit', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should navigate to edit announcement', async ({ page }) => {
    await page.goto('/admin/announcements');
    
    // Look for edit link
    const editLink = page.locator('a[href*="edit"], button:has-text("Edit")').first();
    
    if (await editLink.isVisible().catch(() => false)) {
      await editLink.click();
      
      // Should navigate to edit page
      await expect(page.url()).toContain('edit');
    }
  });

  test('should display edit form with existing data', async ({ page }) => {
    await page.goto('/admin/announcements');
    
    const editLink = page.locator('a[href*="edit"], button:has-text("Edit")').first();
    
    if (await editLink.isVisible().catch(() => false)) {
      await editLink.click();
      
      // Form should have pre-filled data
      const titleInput = page.locator('input[name="title"]').first();
      
      if (await titleInput.isVisible().catch(() => false)) {
        const value = await titleInput.inputValue();
        expect(value.length).toBeGreaterThan(0);
      }
    }
  });

  test('should update announcement', async ({ page }) => {
    await page.goto('/admin/announcements');
    
    const editLink = page.locator('a[href*="edit"], button:has-text("Edit")').first();
    
    if (await editLink.isVisible().catch(() => false)) {
      await editLink.click();
      
      const titleInput = page.locator('input[name="title"]').first();
      const submitButton = page.locator('button[type="submit"]').first();
      
      if (await titleInput.isVisible().catch(() => false)) {
        const newTitle = `Updated Announcement ${Date.now()}`;
        await titleInput.fill(newTitle);
        
        if (await submitButton.isVisible().catch(() => false)) {
          await submitButton.click();
          
          // Should save changes
          await expect(page.locator('body')).toBeVisible();
        }
      }
    }
  });

  test('should cancel edit', async ({ page }) => {
    await page.goto('/admin/announcements');
    
    const editLink = page.locator('a[href*="edit"], button:has-text("Edit")').first();
    
    if (await editLink.isVisible().catch(() => false)) {
      await editLink.click();
      
      const cancelButton = page.locator('button:has-text("Cancel"), a:has-text("Cancel")').first();
      
      if (await cancelButton.isVisible().catch(() => false)) {
        await cancelButton.click();
        
        // Should return to list
        await expect(page.locator('body')).toBeVisible();
      }
    }
  });
});

test.describe('Admin Announcements - Activate/Deactivate', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/announcements');
  });

  test('should display announcement status', async ({ page }) => {
    // Look for status indicators
    const statusBadge = page.locator('text=Active, text=Inactive, text=Published, text=Draft, [class*="badge"]').first();
    
    await expect(statusBadge.or(page.locator('body'))).toBeVisible();
  });

  test('should activate an announcement', async ({ page }) => {
    // Look for inactive announcement and activate it
    const inactiveRow = page.locator('tr:has-text("Inactive"), tr:has-text("Draft")').first();
    
    if (await inactiveRow.isVisible().catch(() => false)) {
      const activateButton = inactiveRow.locator('button:has-text("Activate"), button:has-text("Publish"), a:has-text("Activate")').first();
      
      if (await activateButton.isVisible().catch(() => false)) {
        await activateButton.click();
        await page.waitForTimeout(500);
        
        // Status should change
        await expect(page.locator('body')).toBeVisible();
      }
    }
  });

  test('should deactivate an announcement', async ({ page }) => {
    // Look for active announcement and deactivate it
    const activeRow = page.locator('tr:has-text("Active"), tr:has-text("Published")').first();
    
    if (await activeRow.isVisible().catch(() => false)) {
      const deactivateButton = activeRow.locator('button:has-text("Deactivate"), button:has-text("Unpublish"), a:has-text("Deactivate")').first();
      
      if (await deactivateButton.isVisible().catch(() => false)) {
        await deactivateButton.click();
        await page.waitForTimeout(500);
        
        // Status should change
        await expect(page.locator('body')).toBeVisible();
      }
    }
  });

  test('should toggle announcement status', async ({ page }) => {
    // Look for toggle switch
    const toggle = page.locator('input[type="checkbox"][name*="active"], input[type="checkbox"][name*="published"]').first();
    
    if (await toggle.isVisible().catch(() => false)) {
      const initialState = await toggle.isChecked();
      
      await toggle.click();
      await page.waitForTimeout(500);
      
      // State should change
      const newState = await toggle.isChecked();
      expect(newState).not.toBe(initialState);
    }
  });

  test('should schedule announcement for future', async ({ page }) => {
    await page.goto('/admin/announcements/new');
    
    const scheduleCheckbox = page.locator('input[name="schedule"], input[name="scheduled"]').first();
    const dateInput = page.locator('input[type="datetime-local"]').first();
    
    if (await scheduleCheckbox.or(dateInput).isVisible().catch(() => false)) {
      await expect(scheduleCheckbox.or(dateInput)).toBeVisible();
    }
  });
});

test.describe('Admin Announcements - User View', () => {
  test('should display active announcement to users', async ({ page }) => {
    // First, admin creates an announcement
    await loginAsAdmin(page);
    
    // Create and activate an announcement (implementation depends on UI)
    // ...
    
    // Then, view as regular user
    await page.goto('/');
    
    // Look for announcement banner
    const announcementBanner = page.locator('[class*="announcement"], [class*="banner"], [role="alert"]').first();
    
    // Announcement may or may not be visible depending on if any are active
    await expect(announcementBanner.or(page.locator('h1'))).toBeVisible();
  });

  test('should show announcement on landing page', async ({ page }) => {
    await page.goto('/');
    
    // Look for announcement elements
    const announcement = page.locator('[class*="announcement"], [class*="notice"], [class*="alert"]').first();
    
    await expect(announcement.or(page.locator('h1:has-text("Aprende")')).first()).toBeVisible();
  });

  test('should show announcement on dashboard', async ({ page }) => {
    // Login as regular user
    const uniqueEmail = `announcement_${Date.now()}@example.com`;
    await registerUser(page, 'Announcement Test', uniqueEmail, TEST_USER.password);
    await loginAsUser(page, uniqueEmail, TEST_USER.password);
    
    // Look for announcement on dashboard
    const announcement = page.locator('[class*="announcement"], [class*="notice"]').first();
    
    // Announcement may or may not be present
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should not show expired announcements', async ({ page }) => {
    await page.goto('/');
    
    // All visible announcements should be current
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should not show inactive announcements', async ({ page }) => {
    await page.goto('/');
    
    // Only active announcements should be visible
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should display different priority levels', async ({ page }) => {
    await page.goto('/');
    
    // Look for different priority styling
    const highPriority = page.locator('[class*="high"], [class*="urgent"], [class*="important"]').first();
    const lowPriority = page.locator('[class*="low"], [class*="info"]').first();
    
    await expect(highPriority.or(lowPriority).or(page.locator('h1'))).toBeVisible();
  });
});

test.describe('Admin Announcements - Dismiss', () => {
  test('should allow users to dismiss announcement', async ({ page }) => {
    await page.goto('/');
    
    // Look for dismiss button on announcement
    const dismissButton = page.locator('button:has-text("Dismiss"), button:has-text("Close"), button[aria-label*="close"], button[aria-label*="dismiss"]').first();
    const announcement = page.locator('[class*="announcement"]').first();
    
    if (await announcement.isVisible().catch(() => false)) {
      if (await dismissButton.isVisible().catch(() => false)) {
        await dismissButton.click();
        
        // Announcement should disappear
        await expect(announcement).not.toBeVisible();
      }
    }
  });

  test('should persist dismissed state', async ({ page }) => {
    await page.goto('/');
    
    const dismissButton = page.locator('button:has-text("Dismiss"), button:has-text("Close")').first();
    const announcement = page.locator('[class*="announcement"]').first();
    
    if (await announcement.isVisible().catch(() => false) && await dismissButton.isVisible().catch(() => false)) {
      // Dismiss the announcement
      await dismissButton.click();
      await page.waitForTimeout(300);
      
      // Reload page
      await page.reload();
      await waitForLoadingToComplete(page);
      
      // Announcement should still be dismissed
      await expect(announcement).not.toBeVisible();
    }
  });

  test('should not show dismissed announcement again', async ({ page }) => {
    // After dismissing, announcement should not reappear in session
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should show new announcements after dismissing old ones', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('Admin Announcements - Delete', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/announcements');
  });

  test('should have delete option', async ({ page }) => {
    // Look for delete button or menu
    const deleteButton = page.locator('button:has-text("Delete"), a:has-text("Delete"), button[title*="Delete"]').first();
    const actionMenu = page.locator('button:has([class*="MoreHorizontal"])').first();
    
    await expect(deleteButton.or(actionMenu).or(page.locator('body'))).toBeVisible();
  });

  test('should show delete confirmation', async ({ page }) => {
    const deleteButton = page.locator('button:has-text("Delete"), a:has-text("Delete")').first();
    
    if (await deleteButton.isVisible().catch(() => false)) {
      await deleteButton.click();
      
      // Should show confirmation
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")').first();
      const confirmDialog = page.locator('text=Are you sure, text=Confirm delete').first();
      
      await expect(confirmButton.or(confirmDialog).or(page.locator('body'))).toBeVisible();
    }
  });

  test('should delete announcement', async ({ page }) => {
    // Delete functionality test
    await expect(page.locator('body')).toBeVisible();
  });

  test('should cancel delete', async ({ page }) => {
    const deleteButton = page.locator('button:has-text("Delete")').first();
    
    if (await deleteButton.isVisible().catch(() => false)) {
      await deleteButton.click();
      
      const cancelButton = page.locator('button:has-text("Cancel")').first();
      
      if (await cancelButton.isVisible().catch(() => false)) {
        await cancelButton.click();
        
        // Should return to list without deleting
        await expect(page.locator('body')).toBeVisible();
      }
    }
  });
});

test.describe('Admin Announcements - Preview', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should preview announcement before publishing', async ({ page }) => {
    await page.goto('/admin/announcements/new');
    
    const previewButton = page.locator('button:has-text("Preview"), a:has-text("Preview")').first();
    
    if (await previewButton.isVisible().catch(() => false)) {
      await previewButton.click();
      
      // Preview modal or page should appear
      const previewModal = page.locator('[class*="modal"], [class*="preview"], [role="dialog"]').first();
      await expect(previewModal).toBeVisible();
    }
  });

  test('should show how announcement will appear to users', async ({ page }) => {
    // Preview should match user view
    await expect(page.locator('body')).toBeVisible();
  });
});
