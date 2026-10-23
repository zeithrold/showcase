import { expect } from '@playwright/test'
import { assertAccessible, captureState } from '@ztd-me/frontend-checks/playwright'
import { test } from '../browser-test'
import { setSharedCookie } from './shared-fixtures'

for (const locale of ['en', 'zh-CN'] as const) {
  test(`missing pages preserve the collection and a keyboard return path in ${locale}`, async ({ page, context }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await setSharedCookie(context, { version: 1, mode: 'dark', palette: 'ocean', locale })
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      const response = await page.goto('/missing-collection-page')
      expect(response?.status()).toBe(404)
      await expect(page.locator('html')).toHaveAttribute('lang', locale)
      await expect(page.locator('html')).toHaveAttribute('data-frontend-palette', 'ocean')
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(
        locale === 'en' ? 'Page not found.' : '没有找到这一页。',
      )
      await expect(page.getByRole('banner')).toBeVisible()
      await expect(page.getByRole('contentinfo')).toBeVisible()
      const back = page.getByRole('main').getByRole('link', { name: locale === 'en' ? 'All pages' : '所有页面' })
      await back.focus()
      await expect(back).toBeFocused()
      await back.press('Enter')
      await expect(page).toHaveURL(/\/$/u)
      await expect(page.getByRole('heading', { name: locale === 'en' ? 'Pages' : '页面目录', exact: true })).toBeVisible()
    }
    expect(errors).toEqual([])
  })

  test(`@a11y missing collection page at 320px in ${locale}`, async ({ page, context }, info) => {
    await page.setViewportSize({ width: 320, height: 800 })
    await setSharedCookie(context, { version: 1, mode: 'dark', palette: 'ocean', locale })
    await page.goto('/missing-collection-page')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await assertAccessible(page, info, { label: `recovery-${locale}` })
    await captureState(page, info, `recovery-${locale}`)
  })
}
