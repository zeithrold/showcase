import { expect } from '@playwright/test'
import { captureState } from '@ztd-me/frontend-checks/playwright'
import { test } from '../browser-test'
import { selectAppearance, watchErrors } from '../e2e/helpers'
import { changeLocale } from '../e2e/shared-fixtures'
import { expectSharedState, interceptWorkerOrigins, PREVIEW_ORIGIN, SHOWCASE_ORIGIN } from './worker-origins'

test('preview ignores production preferences and writes only a secure host-only cookie', async ({ context }, info) => {
  await interceptWorkerOrigins(context)
  const value = encodeURIComponent(JSON.stringify({ version: 1, mode: 'dark', palette: 'ocean', locale: 'zh-CN' }))
  await context.addCookies([
    { name: 'ztd.frontend.v1', value, domain: '.ztd.me', path: '/', secure: true },
  ])
  const preview = await context.newPage()
  const errors = watchErrors(preview)
  const response = await preview.goto(`${PREVIEW_ORIGIN}/clock`)
  const html = await response?.text()
  expect(html).toContain('data-frontend-mode="system"')
  expect(html).toContain('data-frontend-palette="neutral"')
  await expectSharedState(preview, 'neutral', 'en')
  await selectAppearance(preview, 'Light')
  await selectAppearance(preview, 'Plum')
  await changeLocale(preview, 'zh-CN')
  const cookies = await context.cookies()
  expect(cookies.find(cookie => cookie.name === 'ztd.frontend.v1')?.value).toBe(value)
  expect(cookies.find(cookie => cookie.name === 'ztd.frontend.preview.showcase.v1')).toMatchObject({
    domain: 'preview.ztd.me',
    secure: true,
    path: '/',
    sameSite: 'Lax',
  })
  await preview.reload()
  await expectSharedState(preview, 'plum', 'zh-CN')
  const production = await context.newPage()
  await production.goto(`${SHOWCASE_ORIGIN}/clock`)
  await expectSharedState(production, 'ocean', 'zh-CN')
  await selectAppearance(production, '苔绿')
  await preview.evaluate(() => window.dispatchEvent(new Event('focus')))
  await expectSharedState(preview, 'plum', 'zh-CN')
  expect(errors).toEqual([])
  await captureState(preview, info, 'preview-host-only-ui-preferences')
})
