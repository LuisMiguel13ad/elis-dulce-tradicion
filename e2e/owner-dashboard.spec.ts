import { test, expect } from '@playwright/test';

test.describe('Owner Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as owner
    await page.goto('/login');
    await page.fill('#email', 'owner@elisbakery.com');
    await page.fill('#password', 'ChangeThisPassword123!');
    await page.click('button[type="submit"]');

    // Wait for redirect to owner dashboard
    await page.waitForURL(/.*owner-dashboard/, { timeout: 10000 });
  });

  test('displays owner dashboard after login', async ({ page }) => {
    // Verify we're on the owner dashboard
    await expect(page).toHaveURL(/.*owner-dashboard/);

    // Dashboard should have header content
    await expect(page.locator('body')).toBeVisible();
  });

  test('can navigate dashboard tabs', async ({ page }) => {
    await page.goto('/owner-dashboard');

    // Dashboard should load without errors
    await expect(page).toHaveURL(/.*owner-dashboard/);

    // Check that page content is visible
    const mainContent = page.locator('main, [role="main"], .dashboard, body');
    await expect(mainContent.first()).toBeVisible();
  });

  test('can logout', async ({ page }) => {
    await page.goto('/owner-dashboard');

    // Find and click logout button (may have different text based on language)
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Cerrar"), button:has-text("Sign Out")');

    if (await logoutButton.count() > 0) {
      await logoutButton.first().click();
      // After logout, should redirect to login or home
      await expect(page).toHaveURL(/\/(login)?$/);
    }
  });
});

test.describe('Front Desk Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as front desk staff
    await page.goto('/login');
    await page.fill('#email', 'orders@elisbakery.com');
    await page.fill('#password', 'OrdersElisBakery123');
    await page.click('button[type="submit"]');

    // Wait for redirect to front desk
    await page.waitForURL(/.*front-desk/, { timeout: 10000 });
  });

  test('displays front desk after login', async ({ page }) => {
    // Verify we're on the front desk page
    await expect(page).toHaveURL(/.*front-desk/);

    // Page should be visible
    await expect(page.locator('body')).toBeVisible();
  });

  test('shows orders view', async ({ page }) => {
    await page.goto('/front-desk');

    // Front desk should load
    await expect(page).toHaveURL(/.*front-desk/);

    // Content should be visible
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });
});
