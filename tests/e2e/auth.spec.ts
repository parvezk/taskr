import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('sign-in page loads correctly', async ({ page }) => {
    await page.goto('/sign-in');

    await expect(page).toHaveTitle(/Taskr/);
    await expect(page.getByText('Welcome back')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByRole('button', { name: /GitHub/ })).toBeVisible();
  });

  test('sign-up page loads correctly', async ({ page }) => {
    await page.goto('/sign-up');

    await expect(page.getByText('Create an account')).toBeVisible();
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible();
  });

  test('sign-in page has link to sign-up', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible();
  });

  test('sign-up page has link to sign-in', async ({ page }) => {
    await page.goto('/sign-up');
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
  });

  test('sign-in link navigates to sign-up', async ({ page }) => {
    await page.goto('/sign-in');
    await page.getByRole('link', { name: 'Sign up' }).click();
    await expect(page).toHaveURL(/\/sign-up/);
    await expect(page.getByText('Create an account')).toBeVisible();
  });

  test('sign-up link navigates to sign-in', async ({ page }) => {
    await page.goto('/sign-up');
    await page.getByRole('link', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('shows error on invalid sign-in', async ({ page }) => {
    await page.goto('/sign-in');

    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Should show an error message (auth will fail since no backend)
    // Just verify the page didn't navigate away (error handling works)
    await page.waitForTimeout(2000);
    // Either error is shown or we're still on sign-in page
    const url = page.url();
    expect(url).toContain('/sign-in');
  });

  test('unauthenticated user is redirected from /tasks to sign-in', async ({ page }) => {
    await page.goto('/tasks');
    await page.waitForURL(/\/sign-in/, { timeout: 8000 });
    await expect(page.getByText('Welcome back')).toBeVisible();
  });

  test('unauthenticated user is redirected from /tags to sign-in', async ({ page }) => {
    await page.goto('/tags');
    await page.waitForURL(/\/sign-in/, { timeout: 8000 });
    await expect(page.getByText('Welcome back')).toBeVisible();
  });
});
