import assert from 'node:assert/strict'
import { test } from 'node:test'
import { DEFAULT_PREFERENCES, formatClock, getClockParts, readPreferences } from '../lib/clock.ts'
import { detectLocale } from '../lib/i18n.ts'

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
    const expected: unknown = DEFAULT_PREFERENCES
    assert.deepEqual(readPreferences(value), expected)
  }
  assert.deepEqual(readPreferences({ timezone: 'UTC', format: '12', seconds: false, theme: 'dark' }), {
    ...DEFAULT_PREFERENCES,
    timezone: 'UTC',
    format: '12',
    seconds: false,
    theme: 'dark',
  })
}).catch((error: unknown) => { throw error })

test('existing preferences migrate without resetting time controls', () => {
  assert.deepEqual(readPreferences({ timezone: 'Asia/Tokyo', format: '12', seconds: false, theme: 'dark' }, 'zh-CN'), {
    timezone: 'Asia/Tokyo',
    format: '12',
    seconds: false,
    theme: 'dark',
    locale: 'zh-CN',
    palette: 'terracotta',
  })
  assert.equal(readPreferences({ locale: 'unknown', palette: 'unknown' }, 'zh-CN').locale, 'zh-CN')
  assert.equal(readPreferences({ locale: 'en', palette: 'ocean' }, 'zh-CN').palette, 'ocean')
}).catch((error: unknown) => { throw error })

test('browser language preference order and unsupported language fallback', () => {
  assert.equal(detectLocale(['zh-TW', 'en-US']), 'zh-CN')
  assert.equal(detectLocale(['fr-FR', 'zh-CN']), 'zh-CN')
  assert.equal(detectLocale(['en-GB', 'zh-CN']), 'en')
  assert.equal(detectLocale(['ja-JP']), 'en')
}).catch((error: unknown) => { throw error })

test('Chinese dates and 12-hour clipboard values follow the chosen locale', () => {
  const date = new Date('2026-10-01T16:00:00Z')
  assert.match(getClockParts(date, 'Asia/Shanghai', '24', 'zh-CN').dateLabel, /2026年10月2日/)
  assert.equal(formatClock(date, 'UTC', '12', false, 'zh-CN'), '下午 04:00')
  assert.equal(formatClock(date, 'UTC', '24', true, 'zh-CN'), '16:00:00')
}).catch((error: unknown) => { throw error })
