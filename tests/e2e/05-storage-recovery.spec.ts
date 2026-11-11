import { test, expect } from '@playwright/test'

test('unreadable Notebook data is preserved instead of silently overwritten', async ({ page }) => {
  const original = JSON.stringify([
    {
      id: 'valid-entry-123', kind: 'note', title: 'Important memory', body: 'Keep this.',
      tags: ['private'], createdAt: '2026-11-11T08:00:00.000Z', updatedAt: '2026-11-11T08:00:00.000Z',
    },
    { brokenEntry: true },
  ])
  await page.addInitScript(value => localStorage.setItem('engram.notebook.v2', value), original)
  await page.goto('/')

  await expect(page.getByRole('alert')).toContainText('could not be read safely')
  await expect(page.getByText('Storage unavailable')).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('engram.notebook.v2'))).toBe(original)

  await page.getByRole('button', { name: 'New page' }).click()
  await expect(page.getByRole('status')).toContainText('read-only')
  expect(await page.evaluate(() => localStorage.getItem('engram.notebook.v2'))).toBe(original)

  await page.getByRole('button', { name: 'Settings', exact: true }).first().click()
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download recovery copy' }).click()
  const download = await downloadPromise
  expect(download.suggestedFilename()).toContain('engram-notebook-recovery')
  expect(await page.evaluate(() => localStorage.getItem('engram.notebook.v2'))).toBe(original)
})

test('corrupt JSON does not become an empty Notebook after reloading', async ({ page }) => {
  const raw = '{an unfinished Notebook backup'
  await page.addInitScript(value => localStorage.setItem('engram.notebook.v2', value), raw)
  await page.goto('/')
  await expect(page.getByRole('alert')).toBeVisible()
  await page.reload()
  await expect(page.getByRole('alert')).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('engram.notebook.v2'))).toBe(raw)
})
