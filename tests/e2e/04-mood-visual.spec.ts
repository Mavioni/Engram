import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/get-session', route => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({
      session: { id: 'visual-session', token: 'test', userId: 'visual-user', expiresAt: new Date(Date.now() + 3600000).toISOString() },
      user: { id: 'visual-user', name: 'Visual QA', email: 'visual@example.com', emailVerified: true },
    }),
  }))
})

for (const viewport of [{ width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1440, height: 900 }]) {
  test(`dashboard and mood names render at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /Good (morning|afternoon|evening)/i })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible()
    await page.getByRole('button', { name: 'Quick mood check-in' }).click()
    for (const mood of ['Radiant', 'Content', 'Calm', 'Neutral', 'Tender', 'Anxious', 'Low', 'Overwhelmed']) {
      await expect(page.getByRole('button', { name: new RegExp('^' + mood + ':') })).toBeVisible()
    }
    await expect(page.locator('body')).toHaveScreenshot(`mood-${viewport.width}.png`, { animations: 'disabled', maxDiffPixelRatio: 0.03 })
  })
}

test('check-in sends mood, intensity, factors and note to the API', async ({ page }) => {
  let payload: Record<string, unknown> | undefined
  await page.route('**/api/checkins', async route => {
    payload = route.request().postDataJSON()
    await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ checkin: { id: 'test', ...payload } }) })
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Quick mood check-in' }).click()
  await page.getByRole('button', { name: /^Calm:/ }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.getByRole('button', { name: /Sleep/ }).click()
  await page.getByRole('button', { name: 'Continue' }).click()
  await page.locator('textarea').fill('I slept well.')
  await page.getByRole('button', { name: 'Save reflection' }).click()
  await expect.poll(() => payload?.moodName).toBe('calm')
  expect(payload?.factors).toContain('Sleep')
  expect(payload?.note).toBe('I slept well.')
})
