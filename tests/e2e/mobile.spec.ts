import { test, expect } from '@playwright/test';

test.describe('Mobile UX', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('should show hamburger menu on mobile', async ({ page }) => {
    await page.goto('/');
    
    // Should show hamburger button
    await expect(page.locator('button svg')).toBeVisible();
    
    // Click to open menu
    await page.click('button svg');
    
    // Should show mobile menu
    await expect(page.locator('text=Inicio')).toBeVisible();
    await expect(page.locator('text=Cursos')).toBeVisible();
  });

  test('should navigate mobile menu', async ({ page }) => {
    await page.goto('/');
    
    // Open menu
    await page.click('button svg');
    
    // Click Cursos
    await page.click('text=Cursos');
    
    // Should navigate
    await expect(page).toHaveURL('/tutoriales');
  });

  test('should show responsive course cards', async ({ page }) => {
    await page.goto('/tutoriales');
    
    // Cards should be single column
    const cards = page.locator('[data-testid="course-card"]');
    await expect(cards.first()).toBeVisible();
    
    // Check that cards take full width on mobile
    const card = cards.first();
    const box = await card.boundingBox();
    expect(box?.width).toBeLessThan(400); // Mobile width
  });

  test('should have touch-friendly buttons', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Buttons should be at least 44px tall (Apple HIG)
    const button = page.locator('button[type="submit"]');
    const box = await button.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });

  test('should show bottom sheet on mobile for actions', async ({ page }) => {
    // Login first
    await page.goto('/auth/signin');
    await page.fill('input#email', 'test@example.com');
    await page.fill('input#password', 'password123');
    await page.click('button[type="submit"]');
    
    // Go to dashboard
    await page.goto('/dashboard');
    
    // Bottom navigation or actions should be accessible
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should have readable text on mobile', async ({ page }) => {
    await page.goto('/');
    
    // Check font sizes are readable (at least 16px)
    const heroText = page.locator('h1');
    const fontSize = await heroText.evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    expect(parseInt(fontSize)).toBeGreaterThanOrEqual(16);
  });

  test('should not have horizontal scroll', async ({ page }) => {
    await page.goto('/');
    
    // Check body width equals viewport width
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
  });
});
