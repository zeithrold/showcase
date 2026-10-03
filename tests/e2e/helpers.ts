import type { Page, TestInfo } from '@playwright/test'
import { expect } from '@playwright/test'
import { captureState } from '@ztd-me/frontend-checks/playwright'
import { setSharedCookie } from './shared-fixtures'

const instant = new Date('2026-10-01T15:59:58.500Z')

export async function openClock(page: Page, time = instant): Promise<void> {
  await page.clock.install({ time })
  await page.clock.pauseAt(time)
  await setSharedCookie(page.context(), { version: 1, mode: 'light', locale: 'en', palette: 'terracotta' })
  await page.addInitScript(() => {
    if (sessionStorage.getItem('showcase-test-seeded') === null) {
      localStorage.setItem('showcase.clock.settings.v1', JSON.stringify({
        version: 1,
        timezone: 'UTC',
        format: '24',
        seconds: true,
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

export async function selectAppearance(
  page: Page,
  option: string,
  within = page.getByRole('banner'),
): Promise<void> {
  const locale = await page.locator('html').getAttribute('lang')
  await within.getByRole('button', { name: locale === 'zh-CN' ? '外观' : 'Appearance', exact: true }).click()
  await page.getByRole('menuitemradio', { name: option, exact: true }).click()
  await expect(page.getByRole('menu')).not.toBeVisible()
}
