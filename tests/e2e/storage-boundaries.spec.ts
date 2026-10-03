import { expect, test } from '@playwright/test'
import { captureState } from '@ztd-me/frontend-checks/playwright'
import { selectAppearance, watchErrors } from './helpers'
import { changeLocale, COOKIE_NAME, setSharedCookie } from './shared-fixtures'
import { auditPreferenceStorage, preferenceStorageAudit } from './storage-audit'

test('missing preferences ignore old/private records without storage changes', async ({ page, context }, info) => {
  const errors = watchErrors(page)
  await context.addCookies([
    { name: 'locale', value: 'zh-CN', domain: 'localhost', path: '/' },
  ])
  await auditPreferenceStorage(page, false)
  await page.goto('/clock')
  await expect(page.locator('html')).toHaveAttribute('data-frontend-mode', 'system')
  await expect(page.locator('html')).toHaveAttribute('data-frontend-palette', 'neutral')
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByRole('combobox', { name: 'Timezone', exact: true })).toHaveText('Local time')
  await expect(page.getByRole('switch', { name: 'Seconds', exact: true })).toBeChecked()
  const before = await preferenceStorageAudit(page)
  expect(before.reads).toEqual(['showcase.clock.settings.v1'])
  expect(before.writes).toEqual([])
  expect((await context.cookies()).some(cookie => cookie.name === COOKIE_NAME)).toBe(false)
  await page.getByRole('combobox', { name: 'Timezone', exact: true }).click()
  await page.getByRole('option', { name: 'Tokyo', exact: true }).click()
  await selectAppearance(page, 'Dark')
  await selectAppearance(page, 'Ocean')
  await changeLocale(page, 'zh-CN')
  await page.evaluate(() => {
    window.dispatchEvent(new Event('focus'))
    document.dispatchEvent(new Event('visibilitychange'))
  })
  const after = await preferenceStorageAudit(page)
  expect(after.reads.every(key => key === 'showcase.clock.settings.v1')).toBe(true)
  expect(after.writes.every(key => key === 'showcase.clock.settings.v1' || key === COOKIE_NAME)).toBe(true)
  expect(after.records).toEqual(before.records)
  expect((await context.cookies()).find(cookie => cookie.name === 'locale')?.value).toBe('zh-CN')
  expect(errors).toEqual([])
  await captureState(page, info, 'old-and-private-records-ignored')
})

test('current UI and clock settings survive without reading other keys', async ({ page, context }) => {
  const errors = watchErrors(page)
  await setSharedCookie(context)
  await auditPreferenceStorage(page, true)
  await page.goto('/clock')
  await expect(page.locator('html')).toHaveAttribute('data-frontend-mode', 'dark')
  await expect(page.locator('html')).toHaveAttribute('data-frontend-palette', 'ocean')
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN')
  await expect(page.getByRole('combobox', { name: '时区', exact: true })).toHaveText('协调世界时')
  await expect(page.getByRole('button', { name: '12 小时', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('switch', { name: '显示秒数', exact: true })).not.toBeChecked()
  const before = await preferenceStorageAudit(page)
  expect(before.reads).toEqual(['showcase.clock.settings.v1'])
  expect(before.writes).toEqual([])
  await changeLocale(page, 'en')
  const saved = (await context.cookies()).find(cookie => cookie.name === COOKIE_NAME)?.value
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByRole('combobox', { name: 'Timezone', exact: true })).toHaveText('Coordinated Universal Time')
  await expect(page.getByRole('button', { name: '12h', exact: true })).toHaveAttribute('aria-pressed', 'true')
  expect((await context.cookies()).find(cookie => cookie.name === COOKIE_NAME)?.value).toBe(saved)
  const after = await preferenceStorageAudit(page)
  expect(after.reads).toEqual(['showcase.clock.settings.v1'])
  expect(after.writes).toEqual([])
  expect(after.records).toEqual(before.records)
  expect(errors).toEqual([])
})
