import { expect, test } from '@playwright/test'
import { captureState } from '@ztd-me/frontend-checks/playwright'
import { selectAppearance, watchErrors } from '../e2e/helpers'
import { changeLocale } from '../e2e/shared-fixtures'
import { expectSharedState, interceptWorkerOrigins, SHOWCASE_ORIGIN, SIBLING_ORIGIN } from './worker-origins'

test('production UI shares on focus while clock and private data stay local', async ({ context }, info) => {
  await interceptWorkerOrigins(context)
  const showcase = await context.newPage()
  const sibling = await context.newPage()
  const errors = [
    watchErrors(showcase),
    watchErrors(sibling),
  ]
  await showcase.addInitScript(() => {
    localStorage.setItem('showcase.clock.settings.v1', JSON.stringify({
      version: 1,
      timezone: 'Asia/Tokyo',
      format: '12',
      seconds: false,
    }))
    localStorage.setItem('synthetic.business.record', JSON.stringify({ token: 'synthetic-private' }))
  })
  await sibling.goto(`${SIBLING_ORIGIN}/clock`)
  await showcase.goto(`${SHOWCASE_ORIGIN}/clock`)
  await selectAppearance(showcase, 'Dark')
  await selectAppearance(showcase, 'Ocean')
  await changeLocale(showcase, 'zh-CN')
  const cookie = (await context.cookies()).find(value => value.name === 'ztd.frontend.v1')
  expect(cookie).toMatchObject({ domain: '.ztd.me', path: '/', sameSite: 'Lax', secure: true })
  expect(cookie?.expires).toBeGreaterThan(Date.now() / 1000 + 31536000 - 60)
  expect(cookie?.expires).toBeLessThan(Date.now() / 1000 + 31536000 + 60)
  expect(JSON.parse(decodeURIComponent(cookie?.value ?? '{}'))).toEqual({
    version: 1,
    mode: 'dark',
    palette: 'ocean',
    locale: 'zh-CN',
  })
  await sibling.evaluate(() => window.dispatchEvent(new Event('focus')))
  await expectSharedState(sibling, 'ocean', 'zh-CN')
  await expect(sibling.getByRole('combobox', { name: '时区', exact: true })).toHaveText('本地时间')
  await expect(showcase.getByRole('combobox', { name: '时区', exact: true })).toHaveText('东京')
  await expect(showcase.getByRole('switch', { name: '显示秒数', exact: true })).not.toBeChecked()
  await selectAppearance(sibling, '苔绿')
  await changeLocale(sibling, 'en')
  await showcase.evaluate(() => window.dispatchEvent(new Event('focus')))
  await expectSharedState(showcase, 'moss', 'en')
  await showcase.reload()
  await expectSharedState(showcase, 'moss', 'en')
  await expect(showcase.getByRole('combobox', { name: 'Timezone', exact: true })).toHaveText('Tokyo')
  const privateRecord = await showcase.evaluate(() => localStorage.getItem('synthetic.business.record'))
  expect(privateRecord).toContain('synthetic-private')
  expect(errors).toEqual([
    [],
    [],
  ])
  await captureState(showcase, info, 'production-shared-ui-local-clock')
})
