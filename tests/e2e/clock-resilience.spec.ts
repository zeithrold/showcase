import { expect } from '@playwright/test'
import { test } from '../browser-test'
import { openClock, selectAppearance, watchErrors } from './helpers'

test('clock preferences still work when browser storage is unavailable', async ({ page }) => {
  const errors = watchErrors(page)
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get: () => { throw new Error('Storage disabled') },
    })
  })
  await page.goto('/clock')
  await expect(page.locator('time.clock-digits')).toHaveAttribute('aria-label', /^\d{2}:\d{2}:\d{2}/)
  await selectAppearance(page, 'Dark')
  await selectAppearance(page, 'Ocean')
  await expect(page.locator('html')).toHaveClass('dark')
  await expect(page.locator('html')).toHaveAttribute('data-frontend-palette', 'ocean')
  await page.getByRole('combobox', { name: 'Language', exact: true }).click()
  await page.getByRole('option', { name: '简体中文' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  expect(errors).toEqual([])
})

test('unavailable clipboard clears its status and pending timers clean up on navigation', async ({ page }) => {
  const errors = watchErrors(page)
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: async () => await Promise.reject(new Error('Clipboard disabled')) },
    })
  })
  await openClock(page)
  await page.getByRole('button', { name: 'Copy current time' }).click()
  await expect(page.getByRole('status')).toHaveText('Copy unavailable in this browser')
  await page.clock.runFor(2500)
  await expect(page.getByRole('status')).toHaveText('')
  await page.getByRole('button', { name: 'Copy current time' }).click()
  await page.getByRole('link', { name: 'All pages', exact: true }).click()
  await page.clock.runFor(3000)
  await expect(page.locator('#clock')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('fullscreen fallback keeps controls usable and Escape exits focus mode', async ({ page }) => {
  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = async () => await Promise.reject(new Error('Fullscreen unavailable'))
  })
  await openClock(page)
  await page.getByRole('button', { name: 'Enter fullscreen' }).click()
  await expect(page.locator('#clock')).toHaveAttribute('data-focused', 'true')
  await page.getByRole('combobox', { name: 'Timezone' }).click()
  await page.getByRole('option', { name: 'Tokyo', exact: true }).click()
  await expect(page.locator('time.clock-digits')).toHaveAttribute('aria-label', '00:59:58, Tokyo')
  await page.keyboard.press('Escape')
  await expect(page.locator('#clock')).toHaveAttribute('data-focused', 'false')
})

test('returning to a visible tab refreshes time without a duplicate timer', async ({ page }) => {
  await openClock(page)
  await page.clock.fastForward(10000)
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
  await expect(page.locator('time.clock-digits')).toHaveAttribute('aria-label', '16:00:08, UTC')
  await page.clock.runFor(600)
  await expect(page.locator('time.clock-digits')).toHaveAttribute('aria-label', '16:00:09, UTC')
})
