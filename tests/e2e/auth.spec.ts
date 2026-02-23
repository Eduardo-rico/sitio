import { test, expect, Page } from '@playwright/test';
import { 
  TEST_USER, 
  ADMIN_USER,
  registerUser, 
  loginAsUser, 
  loginAsAdmin,
  logout,
  waitForLoadingToComplete 
} from './utils';

/**
 * Authentication E2E Tests
 * Comprehensive coverage of auth flows
 */

// Generate unique test user for each test to avoid conflicts
test.describe.configure({ mode: 'parallel' });

test.describe('Auth - Registration', () => {
  test('should register a new user successfully', async ({ page }) => {
    const uniqueEmail = `test_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`;
    const testName = `Test User ${Date.now()}`;
    
    await page.goto('/auth/signup');
    await expect(page).toHaveURL(/.*auth\/signup.*/);
    
    // Verify registration page elements
    await expect(page.locator('h1')).toContainText('Crea tu cuenta gratis');
    await expect(page.locator('input#name')).toBeVisible();
    await expect(page.locator('input#email')).toBeVisible();
    await expect(page.locator('input#password')).toBeVisible();
    await expect(page.locator('input#confirmPassword')).toBeVisible();
    
    // Fill registration form
    await page.fill('input#name', testName);
    await page.fill('input#email', uniqueEmail);
    await page.fill('input#password', TEST_USER.password);
    await page.fill('input#confirmPassword', TEST_USER.password);
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to signin page with success
    await page.waitForURL(/.*auth\/signin.*/, { timeout: 10000 });
    
    // Verify success indication
    await expect(page.locator('text=Bienvenido de nuevo')).toBeVisible();
  });

  test('should show error when registering with existing email', async ({ page }) => {
    // First register a user
    const uniqueEmail = `duplicate_${Date.now()}@example.com`;
    await registerUser(page, 'First User', uniqueEmail, TEST_USER.password);
    
    // Try to register again with same email
    await page.goto('/auth/signup');
    await page.fill('input#name', 'Second User');
    await page.fill('input#email', uniqueEmail);
    await page.fill('input#password', TEST_USER.password);
    await page.fill('input#confirmPassword', TEST_USER.password);
    
    await page.click('button[type="submit"]');
    
    // Should show error
    await expect(page.locator('text=Error al crear la cuenta')).toBeVisible({ timeout: 5000 });
  });

  test('should show error when passwords do not match', async ({ page }) => {
    await page.goto('/auth/signup');
    
    await page.fill('input#name', 'Test User');
    await page.fill('input#email', `mismatch_${Date.now()}@example.com`);
    await page.fill('input#password', 'Password123!');
    await page.fill('input#confirmPassword', 'DifferentPassword123!');
    
    await page.click('button[type="submit"]');
    
    // Should show validation error without submitting
    await expect(page.locator('text=Las contraseñas no coinciden')).toBeVisible({ timeout: 5000 });
  });

  test('should validate password minimum length', async ({ page }) => {
    await page.goto('/auth/signup');
    
    await page.fill('input#name', 'Test User');
    await page.fill('input#email', `short_${Date.now()}@example.com`);
    await page.fill('input#password', 'short');
    await page.fill('input#confirmPassword', 'short');
    
    await page.click('button[type="submit"]');
    
    // Should show validation error
    await expect(page.locator('text=al menos 8 caracteres')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate between login and signup pages', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Click to go to signup
    await page.click('text=Regístrate gratis');
    await expect(page).toHaveURL(/.*auth\/signup.*/);
    await expect(page.locator('h1')).toContainText('Crea tu cuenta gratis');
    
    // Click to go back to signin
    await page.click('text=Inicia sesión');
    await expect(page).toHaveURL(/.*auth\/signin.*/);
    await expect(page.locator('h1')).toContainText('Bienvenido de nuevo');
  });
});

test.describe('Auth - Login', () => {
  test('should login with valid credentials', async ({ page }) => {
    // Register first
    const uniqueEmail = `login_${Date.now()}@example.com`;
    await registerUser(page, 'Login Test User', uniqueEmail, TEST_USER.password);
    
    // Login
    await page.goto('/auth/signin');
    await page.fill('input#email', uniqueEmail);
    await page.fill('input#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 });
    
    // Verify dashboard loaded
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Login Test User')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin');
    
    await page.fill('input#email', 'nonexistent@example.com');
    await page.fill('input#password', 'wrongpassword123!');
    await page.click('button[type="submit"]');
    
    // Should show error
    await expect(page.locator('text=Credenciales inválidas')).toBeVisible({ timeout: 5000 });
    
    // Should stay on login page
    await expect(page).toHaveURL(/.*auth\/signin.*/);
  });

  test('should show error with incorrect password', async ({ page }) => {
    // Register first
    const uniqueEmail = `wrongpass_${Date.now()}@example.com`;
    await registerUser(page, 'Wrong Pass User', uniqueEmail, TEST_USER.password);
    
    // Try to login with wrong password
    await page.goto('/auth/signin');
    await page.fill('input#email', uniqueEmail);
    await page.fill('input#password', 'WrongPassword123!');
    await page.click('button[type="submit"]');
    
    // Should show error
    await expect(page.locator('text=Credenciales inválidas')).toBeVisible({ timeout: 5000 });
  });

  test('should show loading state during login', async ({ page }) => {
    await page.goto('/auth/signin');
    
    await page.fill('input#email', 'test@example.com');
    await page.fill('input#password', 'password123');
    await page.click('button[type="submit"]');
    
    // Should show loading text
    await expect(page.locator('text=Iniciando sesión...')).toBeVisible({ timeout: 2000 });
  });
});

test.describe('Auth - Logout', () => {
  test('should logout successfully', async ({ page }) => {
    // Register and login
    const uniqueEmail = `logout_${Date.now()}@example.com`;
    await registerUser(page, 'Logout Test User', uniqueEmail, TEST_USER.password);
    await loginAsUser(page, uniqueEmail, TEST_USER.password);
    
    // Verify logged in
    await expect(page).toHaveURL('/dashboard');
    
    // Logout
    await page.click('text=Cerrar Sesión');
    
    // Should redirect to home
    await page.waitForURL('/', { timeout: 10000 });
    
    // Verify not authenticated
    await expect(page.locator('text=Entrar')).toBeVisible();
  });
});

test.describe('Auth - Session Persistence', () => {
  test('should maintain session after page reload', async ({ page }) => {
    // Register and login
    const uniqueEmail = `session_${Date.now()}@example.com`;
    await registerUser(page, 'Session Test User', uniqueEmail, TEST_USER.password);
    await loginAsUser(page, uniqueEmail, TEST_USER.password);
    
    // Verify logged in
    await expect(page.locator('text=Session Test User')).toBeVisible();
    
    // Reload page
    await page.reload();
    await waitForLoadingToComplete(page);
    
    // Should still be logged in
    await expect(page.locator('text=Session Test User')).toBeVisible();
    await expect(page.locator('text=Cerrar Sesión')).toBeVisible();
  });

  test('should maintain session when navigating between pages', async ({ page }) => {
    // Register and login
    const uniqueEmail = `nav_${Date.now()}@example.com`;
    await registerUser(page, 'Nav Test User', uniqueEmail, TEST_USER.password);
    await loginAsUser(page, uniqueEmail, TEST_USER.password);
    
    // Navigate to different pages
    await page.goto('/tutoriales');
    await expect(page.locator('text=Cerrar Sesión')).toBeVisible();
    
    await page.goto('/dashboard/cursos');
    await expect(page.locator('text=Cerrar Sesión')).toBeVisible();
    
    // Navigate back to dashboard
    await page.goto('/dashboard');
    await expect(page.locator('text=Nav Test User')).toBeVisible();
  });
});

test.describe('Auth - Protected Routes', () => {
  test('should redirect unauthenticated user from dashboard to login', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login
    await page.waitForURL(/.*auth\/signin.*/, { timeout: 10000 });
    
    // Should have callbackUrl parameter
    await expect(page).toHaveURL(/callbackUrl=.*dashboard/);
  });

  test('should redirect unauthenticated user from admin to login', async ({ page }) => {
    await page.goto('/admin');
    
    // Should redirect to login
    await page.waitForURL(/.*auth\/signin.*/, { timeout: 10000 });
  });

  test('should redirect non-admin user from admin to home', async ({ page }) => {
    // Register and login as regular user
    const uniqueEmail = `nonadmin_${Date.now()}@example.com`;
    await registerUser(page, 'Non Admin User', uniqueEmail, TEST_USER.password);
    await loginAsUser(page, uniqueEmail, TEST_USER.password);
    
    // Try to access admin
    await page.goto('/admin');
    
    // Should redirect to home
    await page.waitForURL('/', { timeout: 10000 });
  });

  test('should allow admin user to access admin panel', async ({ page }) => {
    // Login as admin
    await loginAsAdmin(page);
    
    // Navigate to admin
    await page.goto('/admin');
    
    // Should stay on admin page
    await expect(page).toHaveURL('/admin');
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Admin')).toBeVisible();
  });

  test('should redirect to intended URL after login', async ({ page }) => {
    const uniqueEmail = `callback_${Date.now()}@example.com`;
    await registerUser(page, 'Callback Test', uniqueEmail, TEST_USER.password);
    
    // Try to access dashboard while logged out
    await page.goto('/dashboard');
    await page.waitForURL(/.*auth\/signin.*/);
    
    // Login
    await page.fill('input#email', uniqueEmail);
    await page.fill('input#password', TEST_USER.password);
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard (original destination)
    await page.waitForURL('/dashboard', { timeout: 10000 });
  });
});

test.describe('Auth - Already Authenticated', () => {
  test('should show already logged in state on login page', async ({ page }) => {
    // Register and login
    const uniqueEmail = `already_${Date.now()}@example.com`;
    await registerUser(page, 'Already Auth User', uniqueEmail, TEST_USER.password);
    await loginAsUser(page, uniqueEmail, TEST_USER.password);
    
    // Navigate to login page
    await page.goto('/auth/signin');
    
    // Should show already logged in message
    await expect(page.locator('text=Ya has iniciado sesión')).toBeVisible();
    await expect(page.locator(`text=${uniqueEmail}`)).toBeVisible();
    
    // Should have link to dashboard
    await expect(page.locator('text=Ir al Dashboard')).toBeVisible();
  });

  test('should allow logout from already logged in page', async ({ page }) => {
    // Register and login
    const uniqueEmail = `logoutfrom_${Date.now()}@example.com`;
    await registerUser(page, 'Logout From User', uniqueEmail, TEST_USER.password);
    await loginAsUser(page, uniqueEmail, TEST_USER.password);
    
    // Navigate to login page
    await page.goto('/auth/signin');
    
    // Click logout
    await page.click('text=Cerrar sesión');
    
    // Should redirect to login page
    await page.waitForURL('/auth/signin', { timeout: 10000 });
    
    // Should show login form
    await expect(page.locator('text=Bienvenido de nuevo')).toBeVisible();
  });
});

test.describe('Auth - Form Validation', () => {
  test('should validate required fields on registration', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should stay on page (HTML5 validation)
    await expect(page).toHaveURL(/.*auth\/signup.*/);
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/auth/signup');
    
    await page.fill('input#name', 'Test User');
    await page.fill('input#email', 'invalid-email-format');
    await page.fill('input#password', TEST_USER.password);
    await page.fill('input#confirmPassword', TEST_USER.password);
    
    // Email input should have type="email" for HTML5 validation
    const emailInput = page.locator('input#email');
    await expect(emailInput).toHaveAttribute('type', 'email');
  });

  test('should validate required fields on login', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should stay on page (HTML5 validation)
    await expect(page).toHaveURL(/.*auth\/signin.*/);
  });
});
