import { test, expect } from '@playwright/test'

// TODO: enable when orochimaru's /api/iris Cloudflare Worker is running
// locally via `wrangler dev`. Without the worker, the chat screen falls back
// to a static placeholder reply — the placeholder IS testable, so the test
// is left fixme only because the *real* IRIS reply path is unverified.
test.fixme('chat input sends message and IRIS placeholder reply appears', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })

  // Wait for the IRIS chat screen to be active (default screen)
  const irisHeader = page.locator('.display').filter({ hasText: /IRIS/i }).first()
  await expect(irisHeader).toBeVisible({ timeout: 3_000 })

  // Type a message into the chat input
  const chatInput = page.locator('input[placeholder*="IRIS"]')
  await chatInput.fill("Hello IRIS, I need a moment.")
  await chatInput.press('Enter')

  // Expect the user message bubble to appear
  // Messages are rendered via the Message component; user role bubbles sit
  // inside the scrollable message list.
  const userBubble = page.locator('text="Hello IRIS, I need a moment."')
  await expect(userBubble).toBeVisible({ timeout: 2_000 })

  // Expect an IRIS reply bubble within 5s.
  // The fallback text is "I'm here. (IRIS will respond once you finish setup.)"
  // The live path returns payload.text — either way an iris-role bubble appears.
  const irisBubble = page.locator('text=/I\'m here/i')
  await expect(irisBubble).toBeVisible({ timeout: 5_000 })
})
