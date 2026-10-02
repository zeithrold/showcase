import { expect, test } from '@playwright/test'
import { captureClockState, openClock } from './helpers'

for (const width of [
  1440,
  390,
  320,
]) {
  test(`zero glyphs fit their clipping windows at ${width}px and in fullscreen`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await openClock(page, new Date('2026-10-01T00:00:00Z'))
    await expect(page.locator('[data-digit="0"]')).toHaveCount(6)
    for (const fullscreen of [false, true]) {
      if (fullscreen) {
        await page.getByRole('button', { name: 'Enter fullscreen' }).click()
      }
      await page.evaluate(async () => await document.fonts.ready)
      const bounds = await page.locator('.sliding-digit').evaluateAll((digits) => {
        const context = document.createElement('canvas').getContext('2d')
        if (context === null) {
          throw new Error('Canvas metrics are unavailable')
        }
        return digits.map((digit) => {
          const face = digit.lastElementChild
          if (face === null) {
            throw new Error('Digit face is missing')
          }
          const style = getComputedStyle(face)
          context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
          const ink = context.measureText('0')
          const range = document.createRange()
          range.selectNodeContents(face)
          const text = range.getBoundingClientRect()
          const clip = digit.getBoundingClientRect()
          return {
            left: text.left - ink.actualBoundingBoxLeft,
            right: text.left + ink.actualBoundingBoxRight,
            clipLeft: clip.left,
            clipRight: clip.right,
            height: ink.actualBoundingBoxAscent + ink.actualBoundingBoxDescent,
            clipHeight: clip.height,
          }
        })
      })
      for (const bound of bounds) {
        expect(bound.left).toBeGreaterThanOrEqual(bound.clipLeft - 0.5)
        expect(bound.right).toBeLessThanOrEqual(bound.clipRight + 0.5)
        expect(bound.height).toBeLessThan(bound.clipHeight)
      }
      if (!fullscreen) {
        await captureClockState(page, test.info(), `zero-${width}`)
      }
    }
  })
}

for (const width of [390, 320]) {
  test(`Chinese layout and palette controls fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await openClock(page)
    await page.getByRole('combobox', { name: 'Language', exact: true }).click()
    await page.getByRole('option', { name: '简体中文' }).click()
    await page.getByRole('button', { name: '苔绿', exact: true }).click()
    const widths = await page.evaluate(() => {
      const settings = document.querySelector('.clock-settings')
      if (settings === null) {
        throw new Error('Clock settings are missing')
      }
      return {
        document: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
        settings: settings.scrollWidth,
        settingsClient: settings.clientWidth,
      }
    })
    expect(widths.document).toBeLessThanOrEqual(widths.viewport)
    expect(widths.settings).toBeLessThanOrEqual(widths.settingsClient)
    await captureClockState(page, test.info(), `zh-moss-${width}`)
  })
}

test('fresh Chinese visitors use their browser language without a hydration mismatch', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'zh-CN', timezoneId: 'Asia/Shanghai' })
  const page = await context.newPage()
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text())
    }
  })
  await page.goto(new URL('/clock', test.info().project.use.baseURL ?? 'http://localhost:4173').href)
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  await expect(page.getByRole('combobox', { name: '时区', exact: true })).toHaveText('本地时间')
  await expect(page.locator('.clock-location')).toContainText('上海')
  await expect(page.locator('time.clock-digits')).toHaveAttribute('aria-label', /^上海，\d{2}:\d{2}:\d{2}/)
  expect(errors).toEqual([])
  await context.close()
})
