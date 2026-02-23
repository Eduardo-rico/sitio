import { test, expect } from '@playwright/test';

const ADMIN_CREDENTIALS = {
  email: 'Charalo123',
  password: 'Charalo123'
};

test.describe('Admin User Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('input#email', ADMIN_CREDENTIALS.email);
    await page.fill('input#password', ADMIN_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
    
    await page.goto('/admin/usuarios');
  });

  test('should display users list', async ({ page }) => {
    await expect(page.locator('text=Usuarios')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('should search users', async ({ page }) => {
    await page.fill('input[name="search"]', 'test');
    await page.press('input[name="search"]', 'Enter');
    
    await expect(page.locator('text=Buscando')).toBeVisible();
  });

  test('should filter by role', async ({ page }) => {
    await page.selectOption('select[name="role"]', 'admin');
    await expect(page.locator('text=Admin')).toBeVisible();
  });

  test('should view user detail', async ({ page }) => {
    await page.click('[data-testid="view-user"] >> nth=0');
    
    await expect(page).toHaveURL(/.*admin\/usuarios\/.*/);
    await expect(page.locator('text=Perfil de Usuario')).toBeVisible();
  });

  test('should change user role', async ({ page }) => {
    await page.click('[data-testid="view-user"] >> nth=0');
    
    await page.selectOption('select[name="role"]', 'admin');
    await page.click('text=Guardar cambios');
    
    await expect(page.locator('text=Rol actualizado')).toBeVisible();
  });

  test('should suspend user', async ({ page }) => {
    await page.click('[data-testid="view-user"] >> nth=0');
    
    await page.click('text=Suspender cuenta');
    await page.click('button:has-text("Confirmar")');
    
    await expect(page.locator('text=Usuario suspendido')).toBeVisible();
  });

  test('should export users CSV', async ({ page }) => {
    await page.click('text=Exportar CSV');
    
    await expect(page.locator('text=Exportando')).toBeVisible();
  });

  test('should show user progress', async ({ page }) => {
    await page.click('[data-testid="view-user"] >> nth=0');
    
    await expect(page.locator('text=Progreso')).toBeVisible();
    await expect(page.locator('[data-testid="progress-bar"]').first()).toBeVisible();
  });

  test('should show user activity timeline', async ({ page }) => {
    await page.click('[data-testid="view-user"] >> nth=0');
    
    await page.click('text=Actividad');
    await expect(page.locator('[data-testid="activity-timeline"]')).toBeVisible();
  });
});
