import { expect, test } from '@playwright/test'
import { assertAccessible, captureState } from '@ztd-me/frontend-checks/playwright'
import { openClock } from './helpers'

const palettes = [
  'Terracotta',
  'Moss',
  'Ocean',
  'Plum',
  'Graphite',
]

for (const route of ['/', '/clock']) {
  for (const theme of ['light', 'dark']) {
    test(`@a11y ${route} all palettes in ${theme}`, async ({ page }, testInfo) => {
      await openClock(page)
      await page.clock.setFixedTime(await page.evaluate(() => Date.now()))
      await page.clock.resume()
      if (route === '/') {
        await page.goto('/')
      }
      if (theme === 'dark') {
        await page.getByRole('button', { name: 'Switch to dark theme' }).click()
      }
      for (const palette of palettes) {
        const swatch = page.getByRole('button', { name: palette, exact: true })
        await swatch.click()
        await expect(swatch).toHaveAttribute('aria-pressed', 'true')
        await assertAccessible(page, testInfo, { label: `${route}-${theme}-${palette}` })
        await captureState(page, testInfo, `${theme}-${palette}`)
      }
    })
  }
}

for (const locale of ['en', 'zh-CN']) {
  test(`@a11y mobile ${locale} dialogs and timezone menu`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 320, height: 740 })
    await openClock(page)
    await page.clock.setFixedTime(await page.evaluate(() => Date.now()))
    await page.clock.resume()
    if (locale === 'zh-CN') {
      await page.getByRole('combobox', { name: 'Language', exact: true }).click()
      await page.getByRole('option', { name: '简体中文' }).click()
    }
    await assertAccessible(page, testInfo, { label: `${locale}-mobile-clock` })
    await page.getByRole('button', { name: locale === 'en' ? 'About' : '关于', exact: true }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.getByRole('dialog').evaluate(async (element) => {
      await Promise.all(element.getAnimations({ subtree: true }).map(async animation => await animation.finished))
    })
    await assertAccessible(page, testInfo, { label: `${locale}-about` })
    await captureState(page, testInfo, `${locale}-about`)
    await page.getByRole('button', { name: locale === 'en' ? 'Close' : '关闭', exact: true }).click()
    await page.getByRole('combobox', { name: locale === 'en' ? 'Timezone' : '时区', exact: true }).click()
    await expect(page.getByRole('listbox')).toBeVisible()
    await page.getByRole('listbox').evaluate(async (element) => {
      await Promise.all(element.getAnimations({ subtree: true }).map(async animation => await animation.finished))
    })
    await assertAccessible(page, testInfo, { label: `${locale}-timezone-menu` })
    await captureState(page, testInfo, `${locale}-timezone-menu`)
  })
}
