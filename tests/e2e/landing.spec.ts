import { test, expect } from '@playwright/test';

test.describe('Página Principal', () => {
  test('debería mostrar la landing page correctamente', async ({ page }) => {
    await page.goto('/');
    
    // Verificar elementos principales
    await expect(page.locator('h1')).toContainText('Aprende a Programar');
    await expect(page.locator('text=Eduardo Rico')).toBeVisible();
    
    // Verificar botones de CTA
    await expect(page.locator('text=Comenzar a Aprender')).toBeVisible();
    await expect(page.locator('text=Crear Cuenta Gratis')).toBeVisible();
  });

  test('debería mostrar la sección del curso de Python', async ({ page }) => {
    await page.goto('/');
    
    // Verificar sección de Python
    await expect(page.locator('h2').filter({ hasText: 'Python desde Cero' })).toBeVisible();
    await expect(page.locator('text=100% Gratuito')).toBeVisible();
    await expect(page.locator('text=Editor de código interactivo')).toBeVisible();
    await expect(page.locator('text=Ejercicios prácticos')).toBeVisible();
  });

  test('debería navegar al curso de Python', async ({ page }) => {
    await page.goto('/');
    
    // Click en el botón del curso
    await page.click('text=Ir al Curso');
    
    // Debería ir a la página de tutoriales
    await expect(page).toHaveURL('/tutoriales');
  });

  test('debería mostrar las características del curso', async ({ page }) => {
    await page.goto('/');
    
    // Verificar características
    await expect(page.locator('text=¿Por qué aprender aquí?')).toBeVisible();
    await expect(page.locator('text=Código Interactivo')).toBeVisible();
    await expect(page.locator('text=Contenido Estructurado')).toBeVisible();
    await expect(page.locator('text=Certificado de Finalización')).toBeVisible();
  });

  test('debería mostrar información del instructor', async ({ page }) => {
    await page.goto('/');
    
    // Scroll a la sección sobre el instructor
    await expect(page.locator('text=Sobre el Instructor')).toBeVisible();
    await expect(page.locator('text=Ciencia de Datos')).toBeVisible();
    await expect(page.locator('text=Inteligencia Artificial')).toBeVisible();
  });
});

test.describe('Navegación', () => {
  test('debería tener navegación funcional', async ({ page }) => {
    await page.goto('/');
    
    // Verificar que el navbar está presente
    await expect(page.locator('nav')).toBeVisible();
    
    // Verificar enlaces sociales (si existen)
    const githubLink = page.locator('a[href*="github.com"]');
    if (await githubLink.isVisible().catch(() => false)) {
      await expect(githubLink).toHaveAttribute('href', /github\.com/);
    }
  });
});
