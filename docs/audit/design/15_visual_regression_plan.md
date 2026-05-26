# Visual Regression Plan — Turis Agências

This document outlines the Playwright test plan to run visual regression testing, capture page screenshots, and detect design regressions across the application.

---

## 1. Regression Test Specifications

The visual regression tests will be located under the [tests/](file:///c:/Users/Usuario/Documents/turisagencias/tests/) directory.

```typescript
// tests/visual-regression.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Visual Regression Testing — OMEGA v6.5', () => {
  test('Login Page Visual Compliance', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Check shadowless policy on card container
    const loginCard = page.locator('.glass-card');
    await expect(loginCard).not.toHaveClass(/shadow-/);
    
    await expect(page).toHaveScreenshot('login-page.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('Dashboard Bento Grid Visual Alignment', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check bento card visual alignment
    const bentoCard = page.locator('.bento-card').first();
    await expect(bentoCard).toBeVisible();
    
    await expect(page).toHaveScreenshot('dashboard-omega.png');
  });

  test('Traveler Checkin Portal Mobile Viewport', async ({ page }) => {
    page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/portal/t/test_token/checkin');
    
    // Ensure checkin status card displays correctly
    await expect(page.locator('text=Status do Check-in')).toBeVisible();
    await expect(page).toHaveScreenshot('traveler-portal-mobile.png');
  });
});
```

---

## 2. Screenshot Test Roadmap

1.  **Baseline Screenshot Generation:**
    Generate and save baseline screenshots of the key layout views.
2.  **Continuous Integration (CI) Checks:**
    Run visual regression tests as part of the CI pipeline to catch styling changes and layout shifts.
3.  **Cross-Browser Testing:**
    Verify layouts across multiple browsers (Chromium, Firefox, WebKit) using Playwright.
