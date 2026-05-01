import { test, expect } from '@playwright/test'

// TODO: enable when wrangler dev is running and /api/auth/* is reachable.
// AuthProvider + LoginScreen (mythos-naruto) are not yet committed — these
// tests are fixme until both the auth module and the worker dev server exist.

test.fixme('register flow lands on onboarding', async ({ page }) => {
  await page.goto('/auth/register')

  await page.getByLabel(/display name/i).fill('Test User')
  await page.getByLabel(/email/i).fill('test@example.com')
  await page.getByLabel(/password/i).fill('TestPassword12345!')
  await page.getByRole('button', { name: /create/i }).click()

  // After successful registration the shell should show onboarding step 0.
  // Step 0 is the Welcome screen — no name input, just the "Welcome. Take your time." heading.
  const onboardingHeading = page.locator('h1.display').filter({ hasText: /welcome/i })
  await expect(onboardingHeading).toBeVisible({ timeout: 5_000 })
})

test.fixme('login screen shows from /auth/login', async ({ page }) => {
  // TODO: enable when wrangler dev is running and /api/auth/* is reachable.
  // Route path is TBD — delegated to mythos-naruto.
  await page.goto('/auth/login')

  // LoginScreen should render an email input and a password input at minimum.
  await expect(page.getByLabel(/email/i)).toBeVisible()
  await expect(page.getByLabel(/password/i)).toBeVisible()
})
