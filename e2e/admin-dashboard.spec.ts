import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button:has-text("Login")');
    
    // Wait for redirect
    await page.waitForURL(/.*dashboard/);
  });

  test('displays orders list', async ({ page }) => {
    await page.goto('/bakery-dashboard');
    
    await expect(page.locator('text=Orders')).toBeVisible();
    await expect(page.locator('text=Total Orders')).toBeVisible();
  });

  test('updates order status', async ({ page }) => {
    await page.goto('/bakery-dashboard');
    
    // Find an order and update its status
    const orderCard = page.locator('[data-testid="order-card"]').first();
    await orderCard.click();
    
    // Update status
    await page.click('button:has-text("Update Status")');
    await page.selectOption('select[name="status"]', 'confirmed');
    await page.click('button:has-text("Save")');
    
    // Verify status updated
    await expect(page.locator('text=confirmed')).toBeVisible();
  });

  test('filters orders by status', async ({ page }) => {
    await page.goto('/bakery-dashboard');
    
    // Filter by pending
    await page.click('button:has-text("Filter")');
    await page.click('text=Pending');
    
    // Verify only pending orders shown
    const orders = page.locator('[data-testid="order-card"]');
    const count = await orders.count();
    
    for (let i = 0; i < count; i++) {
      await expect(orders.nth(i).locator('text=pending')).toBeVisible();
    }
  });
});
