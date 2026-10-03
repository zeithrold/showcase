import { expect } from '@playwright/test'
import { test } from '../browser-test'
import { captureClockState, openClock, selectAppearance, watchErrors } from './helpers'

test('header navigation stays within the current showcase routes', async ({ page }) => {
  for (const route of ['/', '/clock']) {
    await page.goto(route)
    const links = page.getByRole('banner').getByRole('link')
    expect(await links.count()).toBeGreaterThan(0)
    for (const link of await links.all()) {
      const href = await link.getAttribute('href')
      expect(href).not.toBeNull()
      const destination = new URL(href ?? '', page.url())
      expect(destination.origin).toBe(new URL(page.url()).origin)
      expect(['/', '/clock']).toContain(destination.pathname)
    }
  }
})

test('appearance changes preserve clock controls through navigation and reload', async ({ page }, testInfo) => {
  const errors = watchErrors(page)
  await openClock(page)
  await page.getByRole('combobox', { name: 'Timezone' }).click()
  await page.getByRole('option', { name: 'Tokyo', exact: true }).click()
  await page.getByRole('button', { name: '12h', exact: true }).click()
  await page.getByRole('switch', { name: 'Seconds' }).click()
  await selectAppearance(page, 'Dark')
  await selectAppearance(page, 'Ocean')
  await page.getByRole('combobox', { name: 'Language', exact: true }).click()
  await page.getByRole('option', { name: '简体中文' }).click()
  await page.getByRole('link', { name: '所有页面', exact: true }).click()
  await expect(page).toHaveURL(/\/$/u)
  await page.getByRole('link', { name: '时钟', exact: true }).click()
  await expect(page).toHaveURL(/\/clock$/u)
  await page.reload()
  await expect(page.getByRole('combobox', { name: '时区', exact: true })).toHaveText('东京')
  await expect(page.getByRole('button', { name: '12 小时', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('switch', { name: '显示秒数', exact: true })).not.toBeChecked()
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  await expect(page.locator('html')).toHaveAttribute('data-frontend-palette', 'ocean')
  await expect(page.locator('html')).toHaveClass('dark')
  expect(errors).toEqual([])
  await captureClockState(page, testInfo, 'clock-controls-after-appearance-change')
})
