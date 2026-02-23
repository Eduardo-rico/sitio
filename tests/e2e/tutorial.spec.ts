import { test, expect } from '@playwright/test';

test.describe('Tutorial Python', () => {
  test('página de tutoriales se carga correctamente', async ({ page }) => {
    await page.goto('/tutoriales');
    
    // Verificar que el título está presente
    await expect(page.getByText('Tutoriales Interactivos de Python')).toBeVisible();
    
    // Verificar que hay contenido
    await expect(page.getByText('Aprende Python ejecutando código')).toBeVisible();
  });

  test('navegación a curso específico', async ({ page }) => {
    await page.goto('/tutoriales');
    
    // Buscar y hacer clic en un curso si existe
    const courseLink = page.getByText('Python desde Cero');
    
    if (await courseLink.isVisible().catch(() => false)) {
      await courseLink.click();
      await expect(page.url()).toContain('/tutoriales/python-desde-cero');
    }
  });

  test('página de admin requiere autenticación', async ({ page }) => {
    await page.goto('/admin');
    
    // Debería redirigir a login o mostrar error
    await expect(page.url()).not.toContain('/admin/dashboard');
  });
});
