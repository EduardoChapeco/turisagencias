import { test, expect } from '@playwright/test';

test.describe('Boarding Missing Fields E2E Tests', () => {
  test('should trigger missing_data when PNR or lastName is missing for LATAM check-in', async ({ page }) => {
    // Setup mock routes
    await page.route('**/functions/v1/airline-build-action-link', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'missing_data',
          url: 'https://www.latamairlines.com/br/pt/minhas-viagens',
          missing_fields: ['lastName'],
          message: 'Campos obrigatórios ausentes para o link direto.'
        })
      });
    });

    // Navigate to the portal
    await page.goto('/portal/t/fake-token-missing/checkin');
    
    // Click on checkin button
    await page.click('button:has-text("Iniciar Check-in Online")');

    // Verify warning status and missing fields display
    await expect(page.locator('text=Campos obrigatórios ausentes para o link direto')).toBeVisible();
    await expect(page.locator('text=Ir para Check-in Manual')).toBeVisible();
  });
});
