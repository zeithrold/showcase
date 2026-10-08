import { expect } from '@playwright/test'
import { captureState } from '@ztd-me/frontend-checks/playwright'
import { test } from '../browser-test'
import { selectAppearance } from './helpers'
import { changeLocale, setSharedCookie } from './shared-fixtures'

test('shared footer keeps the copyright and project destinations in both locales', async ({ page }) => {
  await page.goto('/')
  for (const locale of ['en', 'zh-CN'] as const) {
    if (locale === 'zh-CN') {
      await changeLocale(page, locale)
    }
    const footer = page.getByRole('contentinfo')
    await expect(footer).toContainText('© Zeithrold')
    await expect(footer.getByRole('link')).toHaveCount(2)
    await expect(footer.getByRole('link', { name: 'hello@ztd.me' })).toHaveAttribute('href', 'mailto:hello@ztd.me')
    await expect(footer.locator('a[href="https://github.com/zeithrold/showcase"]')).toHaveText('GitHub')
  }
})

test('homepage lists real pages and opens the clock as a separate route', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text())
    }
  })
  const response = await page.goto('/')
  expect(response?.status()).toBe(200)
  if (response === null) {
    throw new Error('Homepage did not return a response')
  }
  expect(await response.text()).toContain('href="/clock"')
  await expect(page).toHaveTitle('zeithrold/showcase')
  await expect(page.getByRole('heading', { name: 'Pages', exact: true })).toBeVisible()
  await expect(page.locator('.page-list > li')).toHaveCount(1)
  await expect(page.locator('#clock, time.clock-digits')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Clock', exact: true })).toHaveAttribute('href', '/clock')
  await page.getByRole('link', { name: 'Clock', exact: true }).click()
  await expect(page).toHaveURL(/\/clock$/)
  await expect(page.locator('time.clock-digits')).toHaveAttribute('aria-label', /^\d{2}:\d{2}:\d{2}/)
  await page.getByRole('link', { name: 'All pages', exact: true }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { name: 'Pages', exact: true })).toBeVisible()
  await page.goBack()
  await expect(page).toHaveURL(/\/clock$/)
  await expect(page.locator('#clock')).toBeVisible()
  await page.getByRole('link', { name: 'zeithrold/showcase home', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Pages', exact: true })).toBeVisible()
  expect(errors).toEqual([])
})

test('language, palette, theme and clock settings survive navigation and reload', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('combobox', { name: 'Language', exact: true }).click()
  await page.getByRole('option', { name: '简体中文' }).click()
  await expect(page.getByRole('heading', { name: '页面目录', exact: true })).toBeVisible()
  await selectAppearance(page, '海蓝')
  await selectAppearance(page, '深色')
  await page.getByRole('link', { name: '时钟', exact: true }).click()
  await expect(page).toHaveURL(/\/clock$/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  await expect(page.locator('html')).toHaveAttribute('data-frontend-palette', 'ocean')
  await expect(page.locator('html')).toHaveClass(/(?:^|\s)dark(?:\s|$)/u)
  await page.getByRole('combobox', { name: '时区', exact: true }).click()
  await page.getByRole('option', { name: '东京', exact: true }).click()
  await page.getByRole('button', { name: '12 小时', exact: true }).click()
  await page.getByRole('switch', { name: '显示秒数', exact: true }).click()
  await page.getByRole('link', { name: '所有页面', exact: true }).click()
  await expect(page.getByRole('heading', { name: '页面目录', exact: true })).toBeVisible()
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  await expect(page.locator('html')).toHaveAttribute('data-frontend-palette', 'ocean')
  await expect(page.locator('html')).toHaveClass(/(?:^|\s)dark(?:\s|$)/u)
  await page.getByRole('link', { name: '时钟', exact: true }).click()
  await expect(page.getByRole('combobox', { name: '时区', exact: true })).toHaveText('东京')
  await expect(page.getByRole('button', { name: '12 小时', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('switch', { name: '显示秒数', exact: true })).not.toBeChecked()
  await page.reload()
  await expect(page.locator('.sliding-digit')).toHaveCount(4)
  await expect(page.locator('.clock-location')).toContainText('东京')
})

for (const width of [
  1440,
  390,
  320,
]) {
  for (const language of ['en', 'zh-CN'] as const) {
    test(`directory fits ${width}px in ${language}`, async ({ page, context }) => {
      await page.setViewportSize({ width, height: 900 })
      await setSharedCookie(context, { version: 1, mode: 'system', palette: 'neutral', locale: language })
      await page.goto('/')
      await expect(page.locator('html')).toHaveAttribute('lang', language)
      const widths = await page.evaluate(() => ({
        document: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
      }))
      expect(widths.document).toBeLessThanOrEqual(widths.viewport)
      await expect(page.getByRole('link', { name: language === 'en' ? 'Clock' : '时钟', exact: true })).toBeVisible()
      await captureState(page, test.info(), `directory-${language}-${width}`)
    })
  }
}
