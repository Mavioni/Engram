import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/get-session', async (route) => {
    const now = Date.now()
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        session: {
          id: 'session-render-test',
          token: 'render-test-token',
          userId: 'user-render-test',
          expiresAt: new Date(now + 60 * 60 * 1000).toISOString(),
          createdAt: new Date(now).toISOString(),
          updatedAt: new Date(now).toISOString(),
        },
        user: {
          id: 'user-render-test',
          name: 'Engram Render Test',
          email: 'render-test@example.com',
          emailVerified: true,
          createdAt: new Date(now).toISOString(),
          updatedAt: new Date(now).toISOString(),
        },
      }),
    })
  })
})
test('root mounts within 2s and shows IRIS chat header', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  // Splash may appear; wait for the actual IRIS header .display element
  const irisHeader = page.locator('.display').filter({ hasText: /IRIS/i }).first()
  await expect(irisHeader).toBeVisible({ timeout: 2_000 })
})

test('Tweaks panel cycles accents', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  // Wait for shell to mount
  await expect(page.locator('.display').filter({ hasText: /IRIS/i }).first()).toBeVisible()

  // Tweaks panel is fixed bottom-right; open it if collapsed
  const panel = page.locator('.twk-panel')
  const isVisible = await panel.isVisible()
  if (!isVisible) {
    // Panel may be collapsed — click the toggle button to expand
    await page.locator('.twk-panel button').first().click()
  }

  // Click the Lavender radio option inside the Accent radiogroup
  const lavenderBtn = page
    .locator('button[role="radio"]')
    .filter({ hasText: /lavender/i })
  await lavenderBtn.click()

  // Verify dataset.accent updated on <html>
  const accent = await page.evaluate(() => document.documentElement.dataset.accent)
  expect(accent).toBe('lavender')
})

test('NavBar shows 6 tabs', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  // Wait for shell
  await expect(page.locator('.display').filter({ hasText: /IRIS/i }).first()).toBeVisible()

  // NavBar items rendered as buttons inside the nav element
  const navButtons = page.locator('nav button')
  await expect(navButtons).toHaveCount(6)
})
