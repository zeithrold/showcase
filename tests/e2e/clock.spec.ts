import { expect, test } from '@playwright/test'
import { captureClockState, openClock } from './helpers'

test('hydrates cleanly and animates only changed digits through minute rollover', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text())
    }
  })
  await openClock(page)
  const hours = await page.locator('.digit-pair').first().innerHTML()
  await page.clock.runFor(600)
  await expect(page.locator('time.clock-digits')).toHaveAttribute('aria-label', '15:59:59, UTC')
  expect(await page.locator('.digit-pair').first().innerHTML()).toBe(hours)
  const lastDigit = page.locator('.sliding-digit').last()
  await expect(lastDigit.locator('.digit-out')).toHaveText('8')
  await expect(lastDigit.locator('.digit-in')).toHaveText('9')
  const animation = await lastDigit.locator('.digit-in').evaluate(element => getComputedStyle(element).animationName)
  expect(animation).toBe('digit-enter')
  await page.clock.runFor(1000)
  await expect(page.locator('time.clock-digits')).toHaveAttribute('aria-label', '16:00:00, UTC')
  expect(errors).toEqual([])
})

test('timezone, format, seconds, and theme controls work and persist', async ({ page }) => {
  await openClock(page)
  await page.getByRole('combobox', { name: 'Timezone' }).click()
  await page.getByRole('option', { name: 'Shanghai', exact: true }).click()
  await expect(page.locator('time.clock-digits')).toHaveAttribute('aria-label', '23:59:58, Shanghai')
  await page.getByRole('button', { name: '12h', exact: true }).click()
  await page.getByRole('switch', { name: 'Seconds' }).click()
  await expect(page.locator('time.clock-digits')).toHaveAttribute('aria-label', '11:59 PM, Shanghai')
  await expect(page.locator('.sliding-digit')).toHaveCount(4)
  await page.getByRole('button', { name: 'Switch to dark theme' }).click()
  await expect(page.locator('html')).toHaveClass('dark')
  const saved = await page.evaluate((): unknown => JSON.parse(localStorage.getItem('showcase.clock.v1') ?? '{}'))
  expect(saved).toEqual({
    timezone: 'Asia/Shanghai',
    format: '12',
    seconds: false,
    theme: 'dark',
    locale: 'en',
    palette: 'terracotta',
  })
  await page.reload()
  await expect(page.locator('html')).toHaveClass('dark')
  await expect(page.locator('time.clock-digits')).toHaveAttribute('aria-label', '11:59 PM, Shanghai')
  await captureClockState(page, test.info(), 'dark')
})

test('copy returns displayed time, and About opens an accessible dialog', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await openClock(page)
  await page.getByRole('button', { name: 'Copy current time' }).click()
  await expect(page.getByRole('status')).toHaveText('Time copied')
  expect(await page.evaluate(async () => await navigator.clipboard.readText())).toBe('15:59:58')
  await page.getByRole('button', { name: 'About' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
})

test('fullscreen keeps timezone controls usable and exits correctly', async ({ page }) => {
  await openClock(page)
  await page.getByRole('button', { name: 'Enter fullscreen' }).click()
  await expect(page.locator('#clock')).toHaveAttribute('data-focused', 'true')
  await page.getByRole('combobox', { name: 'Timezone' }).click()
  await page.getByRole('option', { name: 'Tokyo', exact: true }).click()
  await expect(page.locator('time.clock-digits')).toHaveAttribute('aria-label', '00:59:58, Tokyo')
  await page.getByRole('button', { name: 'Exit fullscreen' }).click()
  await expect(page.locator('#clock')).toHaveAttribute('data-focused', 'false')
})

test('reduced motion shows the current digit without sliding', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openClock(page)
  await page.clock.runFor(600)
  const incomingDigit = page.locator('.sliding-digit').last().locator('.digit-in')
  const animation = await incomingDigit.evaluate(element => getComputedStyle(element).animationName)
  expect(animation).toBe('none')
  await expect(page.locator('.sliding-digit').last().locator('.digit-out')).not.toBeVisible()
})

for (const viewport of [
  { width: 1440, height: 1100 },
  { width: 390, height: 844 },
  { width: 320, height: 740 },
]) {
  test(`layout fits ${viewport.width}px without horizontal overflow`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await openClock(page)
    await page.clock.runFor(600)
    const widths = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }))
    expect(widths.document).toBeLessThanOrEqual(widths.viewport)
    await captureClockState(page, test.info(), `${viewport.width}`)
  })
}

test('live clock advances using real browser timers', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/clock')
  await expect(page.locator('time.clock-digits')).toHaveAttribute('aria-label', /^\d{2}:\d{2}:\d{2}/)
  const timestamp = await page.locator('time.clock-digits').getAttribute('datetime')
  await expect.poll(async () => await page.locator('time.clock-digits').getAttribute('datetime')).not.toBe(timestamp)
  await captureClockState(page, test.info(), 'live')
})

test('language switch translates dates, controls, accessible labels, and persists', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await openClock(page)
  await expect(page).toHaveTitle('zeithrold/showcase')
  await expect(page.locator('.brand')).toHaveText('zeithrold/showcase')
  await page.getByRole('combobox', { name: 'Language', exact: true }).click()
  await page.getByRole('option', { name: '简体中文' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  await expect(page.locator('h1')).toContainText('让时间，轻轻流动')
  await expect(page.locator('.clock-date')).toContainText('2026年10月1日')
  await page.getByRole('button', { name: '12 小时', exact: true }).click()
  await expect(page.locator('time.clock-digits')).toHaveAttribute('aria-label', 'UTC，下午 03:59:58')
  await page.getByRole('button', { name: '复制当前时间' }).click()
  await expect(page.getByRole('status')).toHaveText('时间已复制')
  expect(await page.evaluate(async () => await navigator.clipboard.readText())).toBe('下午 03:59:58')
  await page.getByRole('button', { name: '关于', exact: true }).click()
  await expect(page.getByRole('dialog')).toContainText('每一处，都用心。')
  await page.getByRole('button', { name: '关闭', exact: true }).click()
  await page.reload()
  await expect(page.getByRole('combobox', { name: '语言', exact: true })).toHaveText('简体中文')
  await expect(page.getByRole('button', { name: '12 小时', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('combobox', { name: '语言', exact: true }).click()
  await page.getByRole('option', { name: 'English' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.locator('time.clock-digits')).toHaveAttribute('aria-label', '03:59:58 PM, UTC')
})

test('all five palettes change the page and clock in both light and dark modes', async ({ page }) => {
  await openClock(page)
  const palettes = [
    'Terracotta',
    'Moss',
    'Ocean',
    'Plum',
    'Graphite',
  ]
  for (const mode of ['light', 'dark']) {
    const backgrounds = new Set<string>()
    const secondsColors = new Set<string>()
    if (mode === 'dark') {
      await page.getByRole('button', { name: 'Switch to dark theme' }).click()
    }
    for (const name of palettes) {
      await page.getByRole('button', { name, exact: true }).click()
      await expect(page.getByRole('button', { name, exact: true })).toHaveAttribute('aria-pressed', 'true')
      const styles = await page.evaluate(() => {
        const seconds = document.querySelector('.seconds-pair')
        if (seconds === null) {
          throw new Error('Seconds digits are missing')
        }
        return {
          background: getComputedStyle(document.body).backgroundColor,
          seconds: getComputedStyle(seconds).color,
        }
      })
      backgrounds.add(styles.background)
      secondsColors.add(styles.seconds)
    }
    expect(backgrounds.size).toBe(5)
    expect(secondsColors.size).toBe(5)
  }
  await page.getByRole('button', { name: 'Ocean', exact: true }).click()
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-palette', 'ocean')
  await expect(page.locator('html')).toHaveClass('dark')
  await captureClockState(page, test.info(), 'ocean-dark')
})
