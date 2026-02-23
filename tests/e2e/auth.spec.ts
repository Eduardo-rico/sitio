import { test, expect } from '@playwright/test';

const TEST_USER = {
  email: 'testuser_e2e@example.com',
  password: 'TestPassword123!',
  name: 'Test User E2E'
};

const ADMIN_USER = {
  email: 'emrs94@gmail.com',
  password: 'Xaralit4!'
};

test.describe('Autenticación', () => {
  
  test('debería mostrar página de login', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Verificar que estamos en la página de login
    await expect(page).toHaveURL(/.*auth\/signin.*/);
    await expect(page.locator('h1')).toContainText('Bienvenido de nuevo');
    await expect(page.locator('input#email')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
  });

  test('debería mostrar página de registro', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Verificar que estamos en la página de registro
    await expect(page).toHaveURL(/.*auth\/signup.*/);
    await expect(page.locator('h1')).toContainText('Crea tu cuenta gratis');
    await expect(page.locator('input#name')).toBeVisible();
    await expect(page.locator('input#email')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
    await expect(page.locator('input#confirmPassword')).toBeVisible();
  });

  test('debería poder navegar entre login y registro', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Click en "Regístrate gratis"
    await page.click('text=Regístrate gratis');
    await expect(page).toHaveURL(/.*auth\/signup.*/);
    
    // Volver a login
    await page.click('text=Inicia sesión');
    await expect(page).toHaveURL(/.*auth\/signin.*/);
  });

  test('debería registrar un nuevo usuario', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Llenar el formulario
    await page.fill('input#name', TEST_USER.name);
    await page.fill('input#email', TEST_USER.email);
    await page.fill('input#password', TEST_USER.password);
    await page.fill('input#confirmPassword', TEST_USER.password);
    
    // Enviar formulario
    await page.click('button[type="submit"]');
    
    // Debería redirigir a login con mensaje de éxito
    await expect(page).toHaveURL(/.*auth\/signin.*/, { timeout: 5000 });
  });

  test('debería mostrar error si las contraseñas no coinciden', async ({ page }) => {
    await page.goto('/auth/signup');
    
    await page.fill('input#name', TEST_USER.name);
    await page.fill('input#email', 'test_different@example.com');
    await page.fill('input#password', 'Password123!');
    await page.fill('input#confirmPassword', 'DifferentPassword123!');
    
    await page.click('button[type="submit"]');
    
    // Debería mostrar error
    await expect(page.locator('text=Las contraseñas no coinciden')).toBeVisible();
  });

  test('debería hacer login con credenciales válidas', async ({ page }) => {
    await page.goto('/auth/signin');
    
    await page.fill('input#email', TEST_USER.email);
    await page.fill('input#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    
    // Debería redirigir al dashboard
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
    
    // Verificar que estamos en el dashboard
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('debería mostrar error con credenciales inválidas', async ({ page }) => {
    await page.goto('/auth/signin');
    
    await page.fill('input#email', 'wrong@example.com');
    await page.fill('input#password', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Debería mostrar error
    await expect(page.locator('text=Credenciales inválidas')).toBeVisible();
  });

  test('debería hacer logout', async ({ page }) => {
    // Primero hacer login
    await page.goto('/auth/signin');
    await page.fill('input#email', TEST_USER.email);
    await page.fill('input#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
    
    // Hacer logout
    await page.click('text=Cerrar Sesión');
    
    // Debería redirigir al home
    await expect(page).toHaveURL('/');
  });
});

test.describe('Admin', () => {
  test('admin debería poder acceder al panel de admin', async ({ page }) => {
    // Login como admin
    await page.goto('/auth/signin');
    await page.fill('input#email', ADMIN_USER.email);
    await page.fill('input#password', ADMIN_USER.password);
    await page.click('button[type="submit"]');
    
    // Ir al admin
    await page.goto('/admin');
    
    // Verificar acceso al admin
    await expect(page).toHaveURL('/admin');
    await expect(page.locator('text=Admin')).toBeVisible();
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('usuario normal NO debería acceder al admin', async ({ page }) => {
    // Login como usuario normal
    await page.goto('/auth/signin');
    await page.fill('input#email', TEST_USER.email);
    await page.fill('input#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    
    // Intentar ir al admin
    await page.goto('/admin');
    
    // Debería ser redirigido al dashboard
    await expect(page).toHaveURL('/dashboard');
  });
});

test.describe('Protección de rutas', () => {
  test('usuario no autenticado debería ser redirigido a login desde dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Debería redirigir a login
    await expect(page).toHaveURL(/.*auth\/signin.*/);
  });

  test('usuario no autenticado debería ser redirigido a login desde admin', async ({ page }) => {
    await page.goto('/admin');
    
    // Debería redirigir a login
    await expect(page).toHaveURL(/.*auth\/signin.*/);
  });
});
