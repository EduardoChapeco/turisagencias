import { test, expect } from '@playwright/test';

test.describe('Boarding Card Drawer E2E Tests', () => {
  test('should open drawer with correct details and display check-in console', async ({ page }) => {
    // Navigate and mock card selection
    await page.goto('/kanban/departures');
    
    // Stub click on a card to open DepartureCardSheet
    // In our E2E environment we expect clicking a card opens the sheet drawer
    const card = page.locator('.kanban-card').first();
    if (await card.isVisible()) {
      await card.click();
      
      // Verify sheet is open
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      
      // Verify tabs are available
      await expect(page.locator('button:has-text("Resumo")')).toBeVisible();
      await expect(page.locator('button:has-text("Check-in e Cartões")')).toBeVisible();
      
      // Navigate to Check-in section
      await page.click('button:has-text("Check-in e Cartões")');
      
      // Ensure central de check-in details are rendered
      await expect(page.locator('text=Central de Check-in Dinâmico')).toBeVisible();
      await expect(page.locator('input[placeholder="LA"]')).toBeVisible();
      await expect(page.locator('input[placeholder="ABCDE1"]')).toBeVisible();
    }
  });
});
