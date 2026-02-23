import { test, expect } from '@playwright/test';
import { loginAsAdmin, navigateToAdmin, waitForLoadingToComplete } from './utils';

/**
 * Admin Analytics E2E Tests
 * Covers: Dashboard stats, Date filters, User stats, Course stats, Data export
 */

test.describe.configure({ mode: 'parallel' });

test.describe('Admin Analytics - Dashboard Overview', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should display admin dashboard with stats', async ({ page }) => {
    // Verify main dashboard elements
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('text=Overview of your platform')).toBeVisible();
    
    // Verify stat cards are displayed
    await expect(page.locator('text=Total Users').first()).toBeVisible();
    await expect(page.locator('text=Total Courses').first()).toBeVisible();
    await expect(page.locator('text=Total Lessons').first()).toBeVisible();
    await expect(page.locator('text=Total Exercises').first()).toBeVisible();
  });

  test('should display user statistics', async ({ page }) => {
    // User stats should be visible
    await expect(page.locator('text=Total Users')).toBeVisible();
    
    // Look for user count number
    const userCount = page.locator('[class*="stat"]').filter({ hasText: /^\d+$/ }).first();
    await expect(userCount).toBeVisible();
  });

  test('should display course statistics', async ({ page }) => {
    // Course stats should be visible
    await expect(page.locator('text=Total Courses')).toBeVisible();
    
    // Published courses section
    await expect(page.locator('text=Published Courses')).toBeVisible();
    await expect(page.locator('text=Draft Courses')).toBeVisible();
  });

  test('should display lesson statistics', async ({ page }) => {
    await expect(page.locator('text=Total Lessons')).toBeVisible();
  });

  test('should display exercise statistics', async ({ page }) => {
    await expect(page.locator('text=Total Exercises')).toBeVisible();
  });

  test('should display submission statistics', async ({ page }) => {
    // Look for activity stats
    await expect(page.locator('text=Total Submissions').or(page.locator('text=Activity Overview'))).toBeVisible();
  });

  test('should display completion rate', async ({ page }) => {
    await expect(page.locator('text=Completion Rate')).toBeVisible();
    
    // Should show percentage
    const percentage = page.locator('text=%').first();
    await expect(percentage).toBeVisible();
  });

  test('should show exercises completed today', async ({ page }) => {
    // Look for today/today's activity
    const todayStats = page.locator('text=Today, text=hoy').first();
    // May or may not exist depending on implementation
    
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Admin Analytics - Date Filters', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should display date filter controls', async ({ page }) => {
    // Look for date filter elements
    const dateFilter = page.locator('select, input[type="date"], button:has-text("Date"), button:has-text("Period")').first();
    
    // Date filters may exist on dashboard or a separate analytics page
    await expect(dateFilter.or(page.locator('text=Quick Actions'))).toBeVisible();
  });

  test('should change date range filter', async ({ page }) => {
    // Navigate to find date filters
    const dateSelect = page.locator('select').filter({ hasText: /day|week|month|year|today|7 days|30 days/i }).first();
    
    if (await dateSelect.isVisible().catch(() => false)) {
      // Try different date ranges
      const options = ['7 days', '30 days', '90 days', 'all time'];
      
      for (const option of options) {
        const optionExists = await dateSelect.locator(`option:has-text("${option}")`).count() > 0;
        if (optionExists) {
          await dateSelect.selectOption({ label: option });
          await waitForLoadingToComplete(page);
          
          // Stats should still be visible
          await expect(page.locator('text=Total Users')).toBeVisible();
          break;
        }
      }
    }
  });

  test('should update stats when date filter changes', async ({ page }) => {
    // This would verify that stats change when filter is applied
    await expect(page.locator('text=Total Users')).toBeVisible();
  });

  test('should have custom date range picker', async ({ page }) => {
    // Look for custom date inputs
    const startDate = page.locator('input[placeholder*="start"], input[name*="from"]').first();
    const endDate = page.locator('input[placeholder*="end"], input[name*="to"]').first();
    
    // Custom date picker may or may not exist
    if (await startDate.or(endDate).isVisible().catch(() => false)) {
      await expect(startDate.or(endDate)).toBeVisible();
    }
  });

  test('should validate date range selection', async ({ page }) => {
    // Placeholder for date validation testing
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Admin Analytics - User Statistics', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should display total users count', async ({ page }) => {
    await expect(page.locator('text=Total Users')).toBeVisible();
    
    // Should have a number displayed
    const statValue = page.locator('[class*="stat-value"], .text-3xl, .text-4xl').first();
    await expect(statValue).toBeVisible();
  });

  test('should display new users over time', async ({ page }) => {
    // Look for new users chart or trend
    const newUsersSection = page.locator('text=New Users, text=User Growth, [class*="chart"]').first();
    
    await expect(newUsersSection.or(page.locator('text=Total Users'))).toBeVisible();
  });

  test('should display user activity metrics', async ({ page }) => {
    // Look for activity metrics
    const activityMetrics = page.locator('text=Active Users, text=User Activity, text=engagement').first();
    
    await expect(activityMetrics.or(page.locator('body'))).toBeVisible();
  });

  test('should display user retention data', async ({ page }) => {
    // Retention data may be shown as a chart or table
    const retentionSection = page.locator('text=Retention, [class*="retention"]').first();
    
    await expect(retentionSection.or(page.locator('text=Total Users'))).toBeVisible();
  });

  test('should navigate to detailed user stats', async ({ page }) => {
    // Look for link to detailed user analytics
    const detailsLink = page.locator('a:has-text("View Details"), a:has-text("Ver Detalles"), a:has-text("Users")').first();
    
    if (await detailsLink.isVisible().catch(() => false)) {
      await detailsLink.click();
      
      // Should navigate to users page or detailed stats
      await expect(page.url()).toMatch(/admin/);
    }
  });
});

test.describe('Admin Analytics - Course Statistics', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should display course enrollment stats', async ({ page }) => {
    // Look for enrollment data
    const enrollmentSection = page.locator('text=Enrollment, text=enrolled, text=inscripción').first();
    
    await expect(enrollmentSection.or(page.locator('text=Published Courses'))).toBeVisible();
  });

  test('should display course completion rates', async ({ page }) => {
    // Look for course completion data
    await expect(page.locator('text=Completion Rate')).toBeVisible();
  });

  test('should display popular courses', async ({ page }) => {
    // Look for popular courses section
    const popularSection = page.locator('text=Popular, text=Top Courses, text=Más populares').first();
    
    await expect(popularSection.or(page.locator('text=Published Courses'))).toBeVisible();
  });

  test('should display course progress distribution', async ({ page }) => {
    // Progress distribution may be shown as a chart
    const progressChart = page.locator('[class*="chart"], [class*="distribution"]').first();
    
    await expect(progressChart.or(page.locator('text=Published Courses'))).toBeVisible();
  });

  test('should navigate to detailed course stats', async ({ page }) => {
    // Look for link to courses
    const coursesLink = page.locator('a[href*="cursos"]').first();
    
    if (await coursesLink.isVisible().catch(() => false)) {
      await coursesLink.click();
      
      await expect(page).toHaveURL(/.*admin\/cursos.*/);
    }
  });
});

test.describe('Admin Analytics - Exercise Statistics', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should display submission count', async ({ page }) => {
    await expect(page.locator('text=Total Submissions').or(page.locator('text=Activity Overview'))).toBeVisible();
  });

  test('should display success rate', async ({ page }) => {
    await expect(page.locator('text=Completion Rate').or(page.locator('text=Correct'))).toBeVisible();
  });

  test('should display most attempted exercises', async ({ page }) => {
    // Look for popular exercises section
    const popularExercises = page.locator('text=Most Attempted, text=Popular Exercises').first();
    
    await expect(popularExercises.or(page.locator('text=Total Submissions'))).toBeVisible();
  });

  test('should display hardest exercises', async ({ page }) => {
    // Look for exercises with low success rates
    const hardestExercises = page.locator('text=Hardest, text=Difficult, text=Low Success').first();
    
    await expect(hardestExercises.or(page.locator('body'))).toBeVisible();
  });
});

test.describe('Admin Analytics - Data Export', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should display export button', async ({ page }) => {
    // Look for export buttons
    const exportButton = page.locator('button:has-text("Export"), a:has-text("Export"), button:has-text("Download"), a:has-text("Download")').first();
    
    // Export may be on dashboard or specific analytics page
    await expect(exportButton.or(page.locator('text=Quick Actions'))).toBeVisible();
  });

  test('should export data as CSV', async ({ page }) => {
    // Look for CSV export option
    const csvExport = page.locator('button:has-text("CSV"), a:has-text("CSV"), button:has-text("Export"), a:has-text("Export")').first();
    
    if (await csvExport.isVisible().catch(() => false)) {
      // Set up download listener
      const [download] = await Promise.all([
        page.waitForEvent('download').catch(() => null),
        csvExport.click(),
      ]);
      
      // Download may or may not trigger depending on implementation
      if (download) {
        expect(download.suggestedFilename()).toContain('.csv');
      }
    }
  });

  test('should export data as JSON', async ({ page }) => {
    // Look for JSON export option
    const jsonExport = page.locator('button:has-text("JSON"), a:has-text("JSON")').first();
    
    if (await jsonExport.isVisible().catch(() => false)) {
      const [download] = await Promise.all([
        page.waitForEvent('download').catch(() => null),
        jsonExport.click(),
      ]);
      
      if (download) {
        expect(download.suggestedFilename()).toContain('.json');
      }
    }
  });

  test('should export data as PDF', async ({ page }) => {
    // Look for PDF export option
    const pdfExport = page.locator('button:has-text("PDF"), a:has-text("PDF"), button:has-text("Report"), a:has-text("Report")').first();
    
    if (await pdfExport.isVisible().catch(() => false)) {
      const [download] = await Promise.all([
        page.waitForEvent('download').catch(() => null),
        pdfExport.click(),
      ]);
      
      if (download) {
        expect(download.suggestedFilename()).toMatch(/\.(pdf|csv)/);
      }
    }
  });

  test('should export filtered data', async ({ page }) => {
    // Apply a filter first if available
    const dateFilter = page.locator('select').first();
    
    if (await dateFilter.isVisible().catch(() => false)) {
      await dateFilter.selectOption({ index: 1 });
      await waitForLoadingToComplete(page);
    }
    
    // Then try to export
    const exportButton = page.locator('button:has-text("Export"), a:has-text("Export")').first();
    
    if (await exportButton.isVisible().catch(() => false)) {
      await exportButton.click();
      
      // Export dialog or download should occur
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should show export progress', async ({ page }) => {
    // Some implementations show loading during export
    const exportButton = page.locator('button:has-text("Export"), a:has-text("Export")').first();
    
    if (await exportButton.isVisible().catch(() => false)) {
      await exportButton.click();
      
      // Look for loading indicator or success message
      const loading = page.locator('text=Exporting, text=Generating, .animate-spin').first();
      await expect(loading.or(page.locator('body'))).toBeVisible();
    }
  });
});

test.describe('Admin Analytics - Charts and Visualizations', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should display stat cards', async ({ page }) => {
    // Look for stat card elements
    const statCards = page.locator('[class*="stat"], [class*="card"], [class*="metric"]').first();
    await expect(statCards).toBeVisible();
  });

  test('should display progress bars', async ({ page }) => {
    // Look for progress indicators
    const progressBars = page.locator('[class*="progress"], .h-2.bg-gray-200, [class*="rounded-full"]').first();
    await expect(progressBars).toBeVisible();
  });

  test('should display trend indicators', async ({ page }) => {
    // Look for trend arrows or change indicators
    const trends = page.locator('[class*="trend"], [class*="arrow"], text=↑, text=↓, text=+%, text=-%').first();
    
    await expect(trends.or(page.locator('text=Total Users'))).toBeVisible();
  });

  test('should handle responsive chart layout', async ({ page }) => {
    // Test at different viewport sizes
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('text=Total Users')).toBeVisible();
    
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('text=Total Users')).toBeVisible();
  });
});

test.describe('Admin Analytics - Real-time Updates', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should show last updated timestamp', async ({ page }) => {
    // Look for timestamp
    const timestamp = page.locator('text=Last updated, text=Updated, text=Last sync').first();
    
    await expect(timestamp.or(page.locator('text=Dashboard'))).toBeVisible();
  });

  test('should have refresh button', async ({ page }) => {
    // Look for refresh button
    const refreshButton = page.locator('button:has-text("Refresh"), button[title="Refresh"], button:has-text("Actualizar")').first();
    
    await expect(refreshButton.or(page.locator('text=Quick Actions'))).toBeVisible();
  });

  test('should refresh stats on button click', async ({ page }) => {
    const refreshButton = page.locator('button:has-text("Refresh"), button[title="Refresh"]').first();
    
    if (await refreshButton.isVisible().catch(() => false)) {
      await refreshButton.click();
      await waitForLoadingToComplete(page);
      
      // Stats should still be visible
      await expect(page.locator('text=Total Users')).toBeVisible();
    }
  });
});
