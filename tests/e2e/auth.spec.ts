import { test, expect } from '@playwright/test';
import { ADMIN_USER, createTestUser, loginAsAdmin, loginUser, registerUser } from './utils';

test.describe('Auth Flows', () => {
  test('register + login redirects to dashboard', async ({ page }) => {
    const user = createTestUser('register-login');

    await registerUser(page, user);
    await loginUser(page, user);

    await expect(page.getByRole('heading', { name: /Bienvenido/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Cerrar Sesión/i })).toBeVisible();
  });

  test('shows duplicate email error on signup', async ({ page }) => {
    const user = createTestUser('duplicate');

    await registerUser(page, user);
    await page.goto('/auth/signup');
    await page.fill('input#name', `second-${user.name}`);
    await page.fill('input#email', user.email);
    await page.fill('input#password', user.password);
    await page.fill('input#confirmPassword', user.password);
    await page.click('button[type="submit"]');

    await expect(page.getByText(/Email already registered/i).first()).toBeVisible();
  });

  test('signup client validation works', async ({ page }) => {
    await page.goto('/auth/signup');
    await page.fill('input#name', 'Mismatch User');
    await page.fill('input#email', createTestUser('mismatch').email);
    await page.fill('input#password', 'Password123!');
    await page.fill('input#confirmPassword', 'DifferentPassword123!');
    await page.click('button[type="submit"]');
    await expect(page.getByText('Las contraseñas no coinciden').first()).toBeVisible();

    await page.fill('input#password', 'short');
    await page.fill('input#confirmPassword', 'short');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/auth\/signup/);
    await expect(page.locator('input#password')).toHaveAttribute('minlength', '8');
  });

  test('invalid credentials show signin error', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('input#email', 'nonexistent@example.com');
    await page.fill('input#password', 'WrongPassword123!');
    await page.click('button[type="submit"]');

    await expect(page.getByText(/Credenciales inválidas/i).first()).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test('protected dashboard redirects unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/auth\/signin\?callbackUrl=%2Fdashboard|\/auth\/signin\?callbackUrl=\/dashboard/);
  });

  test('non admin user cannot access /admin', async ({ page }) => {
    const user = createTestUser('non-admin');

    await registerUser(page, user);
    await loginUser(page, user);

    await page.goto('/admin');
    await expect(page).toHaveURL('/dashboard');
  });

  test('admin user can access /admin', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin');

    await expect(page).toHaveURL('/admin');
    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
    await expect(page.getByText('Analytics Overview')).toBeVisible();
  });

  test('authenticated user sees signed-in state on /auth/signin and can logout', async ({ page }) => {
    const user = createTestUser('already-auth');

    await registerUser(page, user);
    await loginUser(page, user);

    await page.goto('/auth/signin');
    await expect(page.getByRole('heading', { name: 'Ya has iniciado sesión' })).toBeVisible();
    await page.getByRole('button', { name: /Cerrar sesión/i }).click();
    await expect(page).toHaveURL(/\/auth\/signin/);
    await expect(page.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeVisible();
  });

  test('callbackUrl is respected after login', async ({ page }) => {
    const user = createTestUser('callback');

    await registerUser(page, user);
    await page.goto('/auth/signin?callbackUrl=%2Fdashboard%2Fcursos');
    await page.fill('input#email', user.email);
    await page.fill('input#password', user.password);
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard/cursos');
  });

  test('admin credentials remain valid from seed user', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('input#email', ADMIN_USER.email);
    await page.fill('input#password', ADMIN_USER.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });
});
