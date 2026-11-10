import { test, expect } from '@playwright/test';

test('chat sends the conversation, preserves session ID, and explicitly opts into memory', async ({ page }) => {
  const requests: Array<Record<string, unknown>> = [];

  await page.route('**/api/auth/get-session', async (route) => {
    const now = Date.now();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        session: {
          id: 'session-auth-test',
          token: 'test-session-token',
          userId: 'user-test-001',
          expiresAt: new Date(now + 60 * 60 * 1000).toISOString(),
          createdAt: new Date(now).toISOString(),
          updatedAt: new Date(now).toISOString(),
        },
        user: {
          id: 'user-test-001',
          name: 'Engram Test',
          email: 'engram-test@example.com',
          emailVerified: true,
          createdAt: new Date(now).toISOString(),
          updatedAt: new Date(now).toISOString(),
        },
      }),
    });
  });

  await page.route('**/api/intelligence', async (route) => {
    const body = route.request().postDataJSON() as Record<string, unknown>;
    requests.push(body);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        content: 'Engram Intelligence response received.',
        sessionId: 'session-test-001',
      }),
    });
  });

  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const irisHeader = page.locator('.display').filter({ hasText: /IRIS/i }).first();
  await expect(irisHeader).toBeVisible({ timeout: 5_000 });

  const memoryToggle = page.getByLabel('Use saved Engram memory in this conversation');
  await expect(memoryToggle).not.toBeChecked();
  await memoryToggle.check();

  const chatInput = page.locator('input[placeholder*="IRIS"]');
  await chatInput.fill('Hello Engram, remember this context.');
  await chatInput.press('Enter');

  await expect(page.getByText('Engram Intelligence response received.')).toBeVisible();
  expect(requests).toHaveLength(1);
  expect(requests[0].useMemory).toBe(true);
  expect(requests[0].messages).toEqual(expect.arrayContaining([
    expect.objectContaining({
      role: 'user',
      content: 'Hello Engram, remember this context.',
    }),
  ]));
  expect(requests[0].sessionId).toBeUndefined();

  await chatInput.fill('Continue the conversation.');
  await chatInput.press('Enter');
  await expect(page.getByText('Engram Intelligence response received.').nth(1)).toBeVisible();

  expect(requests).toHaveLength(2);
  expect(requests[1].sessionId).toBe('session-test-001');
  expect(requests[1].useMemory).toBe(true);
});
