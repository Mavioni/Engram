import { test, expect } from '@playwright/test'
import { nav, openDevice } from './helpers'

test('imports original note format idempotently and exports readable data', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 412, height: 915 })
  await openDevice(page)
  const original = [{ id: 'original-note-1', date: '2026-11-10', title: 'An ordinary good day', body: 'A quiet walk. A useful conversation. Space to think.', mood: 'steady', tags: ['growth'] }]
  await nav(page, 'Settings')
  for (let attempt = 0; attempt < 2; attempt++) {
    await page.getByLabel('Import notes file').setInputFiles({ name: 'notes.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(original)) })
    await expect(page.getByRole('status')).toContainText('1 of 1 entries imported.')
  }
  await nav(page, 'Timeline')
  await expect(page.getByRole('heading', { name: 'An ordinary good day' })).toHaveCount(1)
  await page.screenshot({ path: testInfo.outputPath('phone-timeline.png') })
  await nav(page, 'Insights')
  await expect(page.getByText('1 POINTS OF REFERENCE', { exact: true })).toBeVisible()
  await expect(page.getByText('growth', { exact: true })).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('phone-mirror.png') })
  await nav(page, 'Settings')
  await page.getByLabel('Import notes file').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('[{"body":"invalid"}]') })
  await expect(page.getByRole('status')).toContainText('No entries were imported.')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export readable JSON' }).click()
  const file = await download
  expect(file.suggestedFilename()).toBe('engram-notebook.json')
})
