import { test, expect } from '@playwright/test';

const ADMIN_CREDENTIALS = {
  email: 'Charalo123',
  password: 'Charalo123'
};

test.describe('Admin Announcements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('input#email', ADMIN_CREDENTIALS.email);
    await page.fill('input#password', ADMIN_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
    
    await page.goto('/admin/anuncios');
  });

  test('should display announcements list', async ({ page }) => {
    await expect(page.locator('text=Anuncios')).toBeVisible();
    await expect(page.locator('text=Nuevo Anuncio')).toBeVisible();
  });

  test('should create new announcement', async ({ page }) => {
    await page.click('text=Nuevo Anuncio');
    
    await page.fill('input[name="title"]', 'Anuncio de Prueba');
    await page.fill('textarea[name="message"]', 'Este es un mensaje de prueba');
    await page.selectOption('select[name="type"]', 'info');
    await page.selectOption('select[name="displayType"]', 'banner');
    
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/admin/anuncios', { timeout: 5000 });
    await expect(page.locator('text=Anuncio creado')).toBeVisible();
  });

  test('should edit announcement', async ({ page }) => {
    // Click edit on first announcement
    await page.click('[data-testid="edit-announcement"] >> nth=0');
    
    await page.fill('input[name="title"]', 'Anuncio Editado');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Anuncio actualizado')).toBeVisible();
  });

  test('should activate/deactivate announcement', async ({ page }) => {
    const toggle = page.locator('[data-testid="toggle-announcement"] >> nth=0');
    await toggle.click();
    
    await expect(page.locator('text=Estado actualizado')).toBeVisible();
  });

  test('should filter announcements by type', async ({ page }) => {
    await page.selectOption('select[name="filterType"]', 'info');
    await expect(page.locator('text=Filtrando')).toBeVisible();
  });

  test('should show announcement preview', async ({ page }) => {
    await page.goto('/admin/anuncios/nuevo');
    
    await page.fill('input[name="title"]', 'Preview Test');
    await page.fill('textarea[name="message"]', 'Mensaje de preview');
    
    await expect(page.locator('[data-testid="announcement-preview"]')).toBeVisible();
  });
});
