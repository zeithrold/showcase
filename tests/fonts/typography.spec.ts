import { expect } from '@playwright/test'
import { assertAccessible, captureState } from '@ztd-me/frontend-checks/playwright'
import { test } from '../browser-test'
import { watchErrors } from '../e2e/helpers'
import { COOKIE_NAME } from '../e2e/shared-fixtures'
import { assertEmoji, assertGlyphs, assertWeight } from './font-rendering'
import { createFontProfiler } from './font-transfer'
import { reportProfile } from './profiles'
import { addSpecimens } from './specimens'

for (const { scenario, route, locale, coldCap } of [
  { scenario: 'english-page', route: '/', locale: 'en', coldCap: 500_000 },
  { scenario: 'chinese-clock', route: '/clock', locale: 'zh-CN', coldCap: 1_000_000 },
]) {
  test(`${scenario} fonts meet cold and immediate warm budgets`, async ({ page, context }, info) => {
    const errors = watchErrors(page)
    await context.addCookies([
      {
        name: COOKIE_NAME,
        value: encodeURIComponent(JSON.stringify({ version: 1, mode: 'light', palette: 'neutral', locale })),
        url: 'http://localhost:4173',
      },
    ])
    const sample = await createFontProfiler(page)
    for (const phase of ['cold', 'warm'] as const) {
      const resources = await sample(phase, async () => phase === 'cold' ? await page.goto(route) : await page.reload())
      await reportProfile(info, scenario, phase, { resources, coldCap })
      expect(errors).toEqual([])
    }
  })
}

test('Noto specimen renders multilingual glyphs, weights and color emoji', async ({ page, context }, info) => {
  const errors = watchErrors(page)
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (event) => {
      throw new Error(`CSP violation: ${event.violatedDirective} ${event.blockedURI}`)
    })
  })
  const sample = await createFontProfiler(page)
  for (const phase of ['cold', 'warm'] as const) {
    const resources = await sample(phase, async () => {
      if (phase === 'cold') {
        await page.goto('/clock')
      }
      else {
        await page.reload()
      }
      await expect(page.locator('time.clock-digits')).toHaveAttribute('aria-label', /\d{2}:\d{2}/u)
      await addSpecimens(page)
    })
    await reportProfile(info, 'full-specimen', phase, { resources })
  }
  const session = await context.newCDPSession(page)
  await session.send('DOM.enable')
  await session.send('CSS.enable')
  await assertGlyphs(session, info)
  await assertEmoji(session, info)
  await assertWeight(page, info)
  await assertAccessible(page, info, { label: 'full-noto-specimen' })
  await captureState(page, info, 'full-noto-specimen')
  expect(errors).toEqual([])
})
