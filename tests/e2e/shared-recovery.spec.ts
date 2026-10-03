import { expect, test } from '@playwright/test'
import { assertAccessible, captureState } from '@ztd-me/frontend-checks/playwright'
import { selectAppearance, watchErrors } from './helpers'
import { changeLocale, COOKIE_NAME, denyStorage, setSharedCookie } from './shared-fixtures'

for (const width of [1440, 320]) {
  test(`denied cookie and storage preserve SSR preferences and recover at ${width}px`, async ({ page, context }) => {
    const errors = watchErrors(page)
    await page.setViewportSize({ width, height: 900 })
    await setSharedCookie(context)
    await denyStorage(page)
    await page.goto('/clock')
    await expect(page.locator('html')).toHaveAttribute('data-frontend-mode', 'dark')
    await expect(page.locator('html')).toHaveAttribute('data-frontend-palette', 'ocean')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('让时间，轻轻流动')
    const notice = page.locator('.site-content > [role="status"]')
    await expect(notice).toContainText('无法保存')
    await page.getByRole('combobox', { name: '时区', exact: true }).click()
    await page.getByRole('option', { name: '东京', exact: true }).click()
    await page.getByRole('button', { name: '12 小时', exact: true }).click()
    await selectAppearance(page, '浅色')
    await changeLocale(page, 'en')
    await expect(page.getByRole('combobox', { name: 'Timezone', exact: true })).toHaveText('Tokyo')
    await expect(page.getByRole('button', { name: '12h', exact: true })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.locator('html')).toHaveAttribute('data-frontend-mode', 'light')
    await page.evaluate(() => {
      Reflect.set(window, 'denyShowcaseStorage', false)
      window.dispatchEvent(new Event('focus'))
    })
    await expect(notice).toHaveCount(0)
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
    await changeLocale(page, 'en')
    const saved = (await context.cookies()).find(cookie => cookie.name === COOKIE_NAME)
    expect(JSON.parse(decodeURIComponent(saved?.value ?? '{}'))).toEqual({
      version: 1,
      mode: 'dark',
      palette: 'ocean',
      locale: 'en',
    })
    const legacy = await page.evaluate((): unknown => JSON.parse(localStorage.getItem('showcase.clock.v1') ?? '{}'))
    expect(legacy).toEqual({ timezone: 'Asia/Tokyo', token: 'synthetic-private' })
    expect(errors).toEqual([])
  })
}

test('denied localStorage preserves cookie persistence and clock controls', async ({ page, context }) => {
  const errors = watchErrors(page)
  await denyStorage(page, false)
  await page.goto('/clock')
  await selectAppearance(page, 'Dark')
  await selectAppearance(page, 'Plum')
  await changeLocale(page, 'zh-CN')
  await page.getByRole('combobox', { name: '时区', exact: true }).click()
  await page.getByRole('option', { name: '东京', exact: true }).click()
  await expect(page.locator('.site-content > [role="status"]')).toHaveCount(0)
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  await expect(page.locator('html')).toHaveAttribute('data-frontend-mode', 'dark')
  await expect(page.locator('html')).toHaveAttribute('data-frontend-palette', 'plum')
  expect((await context.cookies()).some(cookie => cookie.name === COOKIE_NAME)).toBe(true)
  expect(errors).toEqual([])
})

test('@a11y denied persistence feedback and shared menus remain accessible', async ({ page, context }, info) => {
  await page.setViewportSize({ width: 320, height: 900 })
  await setSharedCookie(context)
  await denyStorage(page)
  await page.goto('/clock')
  await expect(page.locator('.site-content > [role="status"]')).toContainText('无法保存')
  await assertAccessible(page, info, { label: 'denied-storage-page' })
  await page.getByRole('banner').getByRole('button', { name: '外观', exact: true }).click()
  await expect(page.getByRole('menu')).toBeVisible()
  await assertAccessible(page, info, { label: 'denied-storage-appearance' })
  await captureState(page, info, 'denied-storage-appearance')
  await page.keyboard.press('Escape')
  await page.getByRole('combobox', { name: '语言', exact: true }).click()
  await expect(page.getByRole('listbox')).toBeVisible()
  await assertAccessible(page, info, { label: 'denied-storage-locale' })
})
