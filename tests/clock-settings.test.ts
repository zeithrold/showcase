import assert from 'node:assert/strict'
import { test } from 'node:test'
import { DEFAULT_CLOCK_SETTINGS, readClockSettings, TIMEZONES } from '../lib/clock-settings.ts'

test('legacy combined preferences project to local clock settings only', () => {
  const legacy = {
    timezone: 'Asia/Tokyo',
    format: '12',
    seconds: false,
    theme: 'dark',
    locale: 'zh-CN',
    palette: 'ocean',
    account: { id: 'synthetic-account' },
    accessToken: 'synthetic-private-value',
  }
  assert.deepEqual(readClockSettings(legacy), { timezone: 'Asia/Tokyo', format: '12', seconds: false })
}).catch((error: unknown) => { throw error })

test('unknown and malformed clock settings retain deterministic defaults', () => {
  const expected: unknown = DEFAULT_CLOCK_SETTINGS
  for (const value of [
    null,
    42,
    [],
    { timezone: 'Mars/Unknown', format: 'invalid', seconds: 'false' },
  ]) {
    assert.deepEqual(readClockSettings(value), expected)
  }
}).catch((error: unknown) => { throw error })

test('invalid display fields do not reset other valid clock controls', () => {
  assert.deepEqual(readClockSettings({ timezone: 'Europe/London', format: 'invalid', seconds: false }), {
    timezone: 'Europe/London',
    format: '24',
    seconds: false,
  })
  assert.deepEqual(readClockSettings({ timezone: 'invalid', format: '12', seconds: true }), {
    timezone: 'local',
    format: '12',
    seconds: true,
  })
}).catch((error: unknown) => { throw error })

test('every existing selectable timezone survives the clock-only boundary', () => {
  for (const timezone of TIMEZONES) {
    const expected: unknown = timezone.value
    assert.equal(readClockSettings({ timezone: timezone.value }).timezone, expected)
  }
}).catch((error: unknown) => { throw error })
