import assert from 'node:assert/strict'
import { test } from 'node:test'
import { negotiateLocale } from '../components/ui/ztd-me/index.ts'
import { DEFAULT_CLOCK_SETTINGS, formatClock, getClockParts, readClockSettings } from '../lib/clock.ts'
import { showcaseAcceptLanguage } from '../lib/frontend-locale.ts'

test('midnight and noon use correct 12-hour periods', () => {
  assert.equal(formatClock(new Date('2026-10-01T00:00:00Z'), 'UTC', '12', true), '12:00:00 AM')
  assert.equal(formatClock(new Date('2026-10-01T12:00:00Z'), 'UTC', '12', true), '12:00:00 PM')
  assert.equal(formatClock(new Date('2026-10-01T00:00:00Z'), 'UTC', '24', false), '00:00')
}).catch((error: unknown) => { throw error })

test('date and day progress follow the selected timezone at rollover', () => {
  const before = getClockParts(new Date('2026-10-01T15:59:59Z'), 'Asia/Shanghai')
  const after = getClockParts(new Date('2026-10-01T16:00:00Z'), 'Asia/Shanghai')
  assert.equal(before.hour, '23')
  assert.ok(before.progress > 99.99)
  assert.equal(after.hour, '00')
  assert.equal(after.progress, 0)
  assert.match(after.dateLabel, /October 2, 2026/)
  assert.equal(after.offset, 'UTC+08:00')
}).catch((error: unknown) => { throw error })

test('New York offset follows daylight saving time', () => {
  assert.equal(getClockParts(new Date('2026-07-01T12:00:00Z'), 'America/New_York').offset, 'UTC-04:00')
  assert.equal(getClockParts(new Date('2026-12-01T12:00:00Z'), 'America/New_York').offset, 'UTC-05:00')
}).catch((error: unknown) => { throw error })

test('corrupt or unrecognized persisted preferences cannot break the clock', () => {
  for (const value of [
    null,
    'invalid',
    [],
    { timezone: 'Mars/Unknown', format: '13', seconds: 'false', theme: 'purple' },
  ]) {
    const expected: unknown = DEFAULT_CLOCK_SETTINGS
    assert.deepEqual(readClockSettings(value), expected)
  }
  assert.deepEqual(readClockSettings({ timezone: 'UTC', format: '12', seconds: false, theme: 'dark' }), {
    ...DEFAULT_CLOCK_SETTINGS,
    timezone: 'UTC',
    format: '12',
    seconds: false,
  })
}).catch((error: unknown) => { throw error })

test('current clock records retain supported time controls', () => {
  assert.deepEqual(readClockSettings({ timezone: 'Asia/Tokyo', format: '12', seconds: false, theme: 'dark' }), {
    timezone: 'Asia/Tokyo',
    format: '12',
    seconds: false,
  })
}).catch((error: unknown) => { throw error })

test('browser language fallback survives shared negotiation with quality ordering', () => {
  assert.equal(negotiateLocale(showcaseAcceptLanguage('zh-TW,en-US')), 'zh-CN')
  assert.equal(negotiateLocale(showcaseAcceptLanguage('fr-FR,zh-CN')), 'zh-CN')
  assert.equal(negotiateLocale(showcaseAcceptLanguage('en-GB,zh-CN')), 'en')
  assert.equal(negotiateLocale(showcaseAcceptLanguage('ja-JP')), 'en')
  assert.equal(negotiateLocale(showcaseAcceptLanguage('zh-HK;q=0.5,en;q=0.8')), 'en')
  assert.equal(negotiateLocale(showcaseAcceptLanguage('zh-Hant;q=0,en;q=0.8')), 'en')
}).catch((error: unknown) => { throw error })

test('Chinese dates and 12-hour clipboard values follow the chosen locale', () => {
  const date = new Date('2026-10-01T16:00:00Z')
  assert.match(getClockParts(date, 'Asia/Shanghai', '24', 'zh-CN').dateLabel, /2026年10月2日/)
  assert.equal(formatClock(date, 'UTC', '12', false, 'zh-CN'), '下午 04:00')
  assert.equal(formatClock(date, 'UTC', '24', true, 'zh-CN'), '16:00:00')
}).catch((error: unknown) => { throw error })
