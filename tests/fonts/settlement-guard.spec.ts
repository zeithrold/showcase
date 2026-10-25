import { expect } from '@playwright/test'
import { test } from '../browser-test'
import { createFontProfiler } from './font-transfer'

// Short enough to keep the fonts suite cheap, long enough for a real load to settle.
const deadlineMs = 400
// A held request must end the sample, not wait for the test timeout.
const failureBudgetMs = deadlineMs + 5_000

test('a held font file fails the sample within its deadline', async ({ page, context }) => {
  // The stylesheet resolves, the font face never does, so `document.fonts.ready`
  // stays pending for the whole page. Its `load` event waits for that request, so the
  // sample starts at DOMContentLoaded; the settlement deadline is what must end it.
  await context.route('https://fonts.gstatic.com/**', async () => {
    await new Promise<void>(() => {})
  })
  const sample = await createFontProfiler(page, { settleTimeoutMs: deadlineMs })
  const started = Date.now()
  await expect(
    sample('cold', async () => await page.goto('/', { waitUntil: 'domcontentloaded' })),
  ).rejects.toThrow(`Font requests did not settle within ${deadlineMs}ms`)
  expect(Date.now() - started).toBeLessThan(failureBudgetMs)
})

test('a held font stylesheet fails the sample within its deadline', async ({ page, context }) => {
  const sample = await createFontProfiler(page, { settleTimeoutMs: deadlineMs })
  const started = Date.now()
  await expect(sample('warm', async () => {
    // The documented faces load normally first, then one more stylesheet request is
    // held open. It stays in the pending set while `document.fonts.ready` resolves,
    // which is the phase that used to wait without a deadline.
    await page.goto('/')
    await context.route('https://fonts.googleapis.com/**', () => {})
    await page.evaluate(() => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://fonts.googleapis.com/css2?family=Roboto&display=swap'
      document.head.append(link)
    })
  })).rejects.toThrow(`Font requests did not settle within ${deadlineMs}ms`)
  expect(Date.now() - started).toBeLessThan(failureBudgetMs)
})
