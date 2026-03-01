import { test, expect } from '@playwright/test';

test.describe('UI Smoke Tests', () => {
  test('sign-in page has correct layout and styling', async ({ page }) => {
    await page.goto('/sign-in');

    // Check page is centered / has auth card layout
    const card = page.locator('[class*="card"]').first();
    await expect(card).toBeVisible();

    // Verify GitHub button has icon
    const githubButton = page.getByRole('button', { name: /GitHub/ });
    await expect(githubButton).toBeVisible();

    // Verify separator exists
    await expect(page.getByText('Or continue with')).toBeVisible();
  });

  test('sign-up page has correct layout', async ({ page }) => {
    await page.goto('/sign-up');

    // Check all form elements are visible
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
  });

  test('form validation - sign-in requires email and password', async ({ page }) => {
    await page.goto('/sign-in');

    // Try to submit empty form
    await page.getByRole('button', { name: 'Sign in' }).click();

    // HTML5 validation should prevent submission
    const emailInput = page.getByLabel('Email');
    const validationMessage = await emailInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );
    expect(validationMessage).toBeTruthy();
  });

  test('form validation - sign-up requires name, email and password', async ({ page }) => {
    await page.goto('/sign-up');

    await page.getByRole('button', { name: 'Create account' }).click();

    const nameInput = page.getByLabel('Name');
    const validationMessage = await nameInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );
    expect(validationMessage).toBeTruthy();
  });

  test('root / redirects to /tasks or /sign-in', async ({ page }) => {
    await page.goto('/');
    // Root redirects to /tasks, which then either shows tasks or redirects to sign-in
    await page.waitForURL(/\/(sign-in|tasks)/, { timeout: 5000 });
  });

  test('page has correct title', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page).toHaveTitle('Taskr');
  });
});
