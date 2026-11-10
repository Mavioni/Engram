import { test, expect } from '@playwright/test'
import { nav } from './helpers'

test('production notebook reopens offline with its encrypted entry and correct source link', async ({ page, context }) => {
  await page.goto('http://127.0.0.1:4173')
  await page.getByLabel('Vault passphrase', { exact: true }).fill('Disposable-offline-test-2026!')
  await page.getByLabel('Confirm passphrase', { exact: true }).fill('Disposable-offline-test-2026!')
  await page.getByRole('button', { name: 'Create private notebook' }).click()
  await page.getByRole('button', { name: 'Classic', exact: true }).click()
  await page.getByLabel('Entry title', { exact: true }).fill('Offline continuity')
  await page.getByLabel('Journal entry', { exact: true }).fill('My words should be available without a network.')
  await page.getByRole('button', { name: 'Save entry', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Entry saved', exact: true })).toBeVisible()
  await page.evaluate(async () => { await navigator.serviceWorker.ready })
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true)
  await context.setOffline(true)
  await page.reload()
  await page.getByLabel('Vault passphrase', { exact: true }).fill('Disposable-offline-test-2026!')
  await page.getByRole('button', { name: 'Unlock notebook' }).click()
  await nav(page, 'Timeline')
  await expect(page.getByRole('heading', { name: 'Offline continuity' })).toBeVisible()
  await nav(page, 'Settings')
  await expect(page.getByRole('link', { name: 'Corresponding source' })).toHaveAttribute('href', /feat\/notes-interface-alpha/u)
})
