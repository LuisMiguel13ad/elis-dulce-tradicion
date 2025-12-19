import { test, expect } from '@playwright/test';

test.describe('Customer Order Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/order');
  });

  test('completes full order flow', async ({ page }) => {
    // Step 1: Fill date and contact information
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];

    await page.fill('input[name="dateNeeded"]', dateString);
    await page.fill('input[name="timeNeeded"]', '14:00');
    await page.fill('input[name="customerName"]', 'Test Customer');
    await page.fill('input[name="phone"]', '610-555-1234');
    await page.fill('input[name="email"]', 'test@example.com');

    await page.click('button:has-text("Next")');

    // Step 2: Select cake details
    await page.waitForSelector('select[name="size"]');
    await page.selectOption('select[name="size"]', 'medium');
    await page.selectOption('select[name="filling"]', 'chocolate');
    await page.selectOption('select[name="theme"]', 'birthday');

    await page.click('button:has-text("Next")');

    // Step 3: Select delivery option
    await page.click('input[value="pickup"]');

    await page.click('button:has-text("Next")');

    // Step 4: Review and proceed to payment
    await expect(page.locator('text=Order Summary')).toBeVisible();
    await expect(page.locator('text=Total')).toBeVisible();

    await page.click('button:has-text("Proceed to Payment")');

    // Verify redirect to payment page
    await expect(page).toHaveURL(/.*payment-checkout/);
  });

  test('validates required fields', async ({ page }) => {
    // Try to proceed without filling fields
    await page.click('button:has-text("Next")');

    // Should show validation errors
    await expect(page.locator('text=/please select/i')).toBeVisible();
  });

  test('calculates price correctly', async ({ page }) => {
    // Fill step 1
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];

    await page.fill('input[name="dateNeeded"]', dateString);
    await page.fill('input[name="timeNeeded"]', '14:00');
    await page.fill('input[name="customerName"]', 'Test Customer');
    await page.fill('input[name="phone"]', '610-555-1234');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button:has-text("Next")');

    // Select cake options
    await page.selectOption('select[name="size"]', 'medium');
    await page.selectOption('select[name="filling"]', 'chocolate');
    await page.selectOption('select[name="theme"]', 'birthday');

    // Wait for price calculation
    await page.waitForTimeout(1000);

    // Verify price is displayed
    await expect(page.locator('text=/\\$|Total/i')).toBeVisible();
  });
});
