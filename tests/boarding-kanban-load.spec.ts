import { test, expect } from '@playwright/test';

test.describe('Boarding Kanban Load E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Supabase Auth and Kanban Card calls
    await page.route('**/rest/v1/kanban_cards*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'd9b01234-5678-1234-5678-1234567890ab',
            title: 'Maria da Silva - Cancún',
            column_id: 'col-checkin',
            assigned_to: 'user-123',
            org_id: 'org-123',
            metadata: {
              destination: 'Cancún',
              airline_name: 'LA',
              flight_locator: 'ABCDEF',
              check_in_date: '2026-12-10',
              check_in_time: '14:30'
            }
          }
        ])
      });
    });

    await page.route('**/rest/v1/kanban_columns*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'col-docs', name: 'Documentação Pendente', position: 1 },
          { id: 'col-checkin', name: 'Check-in Disponível', position: 2 },
          { id: 'col-boarding', name: 'Embarque', position: 3 }
        ])
      });
    });

    await page.route('**/rest/v1/kanban_boards*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'board-departures', type: 'departures', name: 'Boarding Board' }
        ])
      });
    });
  });

  test('should render the kanban board with custom columns and card badges', async ({ page }) => {
    // Navigate to the departures board
    await page.goto('/kanban/departures');

    // Verify page header
    const header = page.locator('h1');
    await expect(header).toContainText('Embarques');

    // Verify columns exist
    await expect(page.locator('text=Check-in Disponível')).toBeVisible();

    // Verify card is loaded in the correct column with its flight details
    const card = page.locator('.kanban-card');
    await expect(card).toContainText('Maria da Silva - Cancún');
    await expect(card).toContainText('LA');
    await expect(card).toContainText('ABCDEF');
  });
});
