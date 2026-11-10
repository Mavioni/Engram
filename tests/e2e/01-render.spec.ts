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

test('root mounts and shows the IRIS conversation header', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  const irisHeader = page.locator('.display').filter({ hasText: /IRIS/i }).first()
  await expect(irisHeader).toBeVisible({ timeout: 5_000 })
})

test('root applies the default appearance settings', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.display').filter({ hasText: /IRIS/i }).first()).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.accent)).toBe('ocean')
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).toBe('dark')
})

test('navigation exposes six destinations and the quick check-in action', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.display').filter({ hasText: /IRIS/i }).first()).toBeVisible()
  const navButtons = page.locator('nav button')
  await expect(navButtons).toHaveCount(7)
  await expect(navButtons.filter({ has: page.locator('svg') })).toHaveCount(7)
})
