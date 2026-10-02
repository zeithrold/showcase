import type { Page, TestInfo } from '@playwright/test'
import { expect } from '@playwright/test'
import { captureState } from '@ztd-me/frontend-checks/playwright'

const instant = new Date('2026-10-01T15:59:58.500Z')

export async function openClock(page: Page, time = instant): Promise<void> {
  await page.clock.install({ time })
  await page.clock.pauseAt(time)
  await page.addInitScript(() => {
    if (sessionStorage.getItem('showcase-test-seeded') === null) {
      localStorage.setItem('showcase.clock.v1', JSON.stringify({
        timezone: 'UTC',
        format: '24',
        seconds: true,
        theme: 'light',
        locale: 'en',
        palette: 'terracotta',
      }))
      sessionStorage.setItem('showcase-test-seeded', 'true')
    }
  })
  await page.goto('/clock')
  await expect(page.locator('time.clock-digits')).toHaveAttribute(
    'aria-label',
    `${time.toISOString().slice(11, 19)}, UTC`,
  )
}

export function watchErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text())
    }
  })
  return errors
}

export async function captureClockState(page: Page, testInfo: TestInfo, label: string): Promise<void> {
  // Keep the display fixed while allowing browser animation frames to paint.
  await page.clock.setFixedTime(await page.evaluate(() => Date.now()))
  await page.clock.resume()
  await page.locator('time.clock-digits').evaluate(async (element) => {
    await Promise.all(element.getAnimations({ subtree: true }).map(async animation => await animation.finished))
  })
  await captureState(page, testInfo, label)
}
