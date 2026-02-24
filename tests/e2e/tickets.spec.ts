import { test, expect } from '@playwright/test';
import { createTestUser, loginAsAdmin, loginUser, registerUser } from './utils';

test.describe('Issue Tickets', () => {
  test('authenticated user can report and admin can triage', async ({ page }) => {
    const learner = createTestUser('ticket');
    const ticketTitle = `Ticket E2E ${Date.now()}`;

    await registerUser(page, learner);
    await loginUser(page, learner);

    await page.goto('/tutoriales');
    await expect(page.getByTestId('issue-report-fab')).toBeVisible();
    await page.getByTestId('issue-report-fab').click();

    await page.getByTestId('issue-ticket-category').selectOption('bug');
    await page.getByTestId('issue-ticket-title').fill(ticketTitle);
    await page
      .getByTestId('issue-ticket-description')
      .fill('Se detecto un problema reproducible en el flujo de e2e de tickets.');
    const createTicketResponse = page.waitForResponse(
      (response) => response.url().includes('/api/tickets') && response.request().method() === 'POST'
    );
    await page.getByTestId('issue-ticket-submit').click();
    const createResponse = await createTicketResponse;
    expect(createResponse.status()).toBe(200);

    await expect(page.getByTestId('issue-ticket-title')).not.toBeVisible();

    await page.context().clearCookies();
    await page.goto('/auth/signin');
    await loginAsAdmin(page);

    await page.goto('/admin/tickets');
    await expect(page.getByRole('heading', { name: 'Tickets de incidencias' })).toBeVisible();

    await page.getByTestId('tickets-search-input').fill(ticketTitle);
    const ticketRow = page.locator('tr', { hasText: ticketTitle }).first();
    await expect(ticketRow).toBeVisible({ timeout: 20000 });

    await ticketRow.locator('select').nth(0).selectOption('triaged');
    await ticketRow.locator('select').nth(1).selectOption('high');
    await ticketRow.locator('textarea').fill('Validado por e2e: requiere seguimiento.');
    await ticketRow.getByRole('button', { name: 'Guardar' }).click();

    await expect(ticketRow.locator('select').nth(0)).toHaveValue('triaged');
    await expect(ticketRow.locator('select').nth(1)).toHaveValue('high');
  });
});
