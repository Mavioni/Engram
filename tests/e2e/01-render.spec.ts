import { test, expect } from '@playwright/test'

test('Notebook is the home screen with an honest empty state', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Make room for thought/i })).toBeVisible()
  await expect(page.getByText('Your notebook starts here.')).toBeVisible()
  await expect(page.getByText('Stored in this browser')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Notebook', exact: true }).first()).toBeVisible()
})

test('note auto-saves on this device and survives browser reload', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'New page' }).click()
  await page.getByRole('textbox', { name: 'Page title' }).fill('My new beginning')
  await page.getByRole('textbox', { name: 'Page content' }).fill('I want to record what matters to me.')
  await expect(page.getByText('My new beginning').first()).toBeVisible()
  await expect.poll(async () => page.evaluate(() => localStorage.getItem('engram.notebook.v2')?.includes('My new beginning'))).toBe(true)
  await page.reload()
  await page.getByRole('button', { name: /My new beginning/ }).click()
  await expect(page.getByRole('textbox', { name: 'Page title' })).toHaveValue('My new beginning')
  await expect(page.getByRole('textbox', { name: 'Page content' })).toHaveValue('I want to record what matters to me.')
})

test('task completion appears in actual Today counts', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'New task' }).click()
  await page.getByRole('textbox', { name: 'Page title' }).fill('Finish my reading')
  await page.getByRole('button', { name: 'Today', exact: true }).first().click()
  await expect(page.getByText('Finish my reading')).toBeVisible()
  await expect(page.getByText('OPEN TASKS')).toBeVisible()
  await page.getByRole('checkbox').check()
  await expect(page.getByText('Finish my reading')).toHaveCount(0)
})
