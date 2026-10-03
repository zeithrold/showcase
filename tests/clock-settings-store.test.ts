import assert from 'node:assert/strict'
import { test } from 'node:test'
import { CLOCK_SETTINGS_KEY, createClockSettingsStore } from '../lib/clock-settings-store.ts'

function memoryStorage(records: Record<string, string> = {}): {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
} {
  const values = new Map(Object.entries(records))
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value) },
  }
}

test('clock migration preserves legacy UI and private fields without rewriting them', () => {
  const legacy = JSON.stringify({
    timezone: 'Asia/Tokyo',
    format: '12',
    seconds: false,
    theme: 'dark',
    token: 'private',
  })
  const storage = memoryStorage({ 'showcase.clock.v1': legacy })
  const store = createClockSettingsStore(storage)
  const unsubscribe = store.subscribe(() => {})
  assert.deepEqual(store.getSnapshot().settings, { timezone: 'Asia/Tokyo', format: '12', seconds: false })
  assert.equal(storage.getItem(CLOCK_SETTINGS_KEY), null)
  store.update({ timezone: 'UTC' })
  assert.deepEqual(JSON.parse(storage.getItem(CLOCK_SETTINGS_KEY) ?? '{}'), {
    version: 1,
    timezone: 'UTC',
    format: '12',
    seconds: false,
  })
  const expected: unknown = legacy
  assert.equal(storage.getItem('showcase.clock.v1'), expected)
  unsubscribe()
}).catch((error: unknown) => { throw error })

test('new clock settings win over stale legacy settings', () => {
  const storage = memoryStorage({
    [CLOCK_SETTINGS_KEY]: JSON.stringify({ version: 1, timezone: 'UTC', format: '24', seconds: true }),
    'showcase.clock.v1': JSON.stringify({ timezone: 'Asia/Tokyo', format: '12', seconds: false }),
  })
  const store = createClockSettingsStore(storage)
  const unsubscribe = store.subscribe(() => {})
  assert.deepEqual(store.getSnapshot().settings, { timezone: 'UTC', format: '24', seconds: true })
  unsubscribe()
}).catch((error: unknown) => { throw error })

test('malformed and future local records fall back without automatic overwrites', () => {
  for (const saved of [
    '{invalid',
    JSON.stringify({ version: 2, timezone: 'UTC' }),
  ]) {
    const storage = memoryStorage({
      [CLOCK_SETTINGS_KEY]: saved,
      'showcase.clock.v1': JSON.stringify({ timezone: 'Europe/Paris' }),
    })
    const store = createClockSettingsStore(storage)
    const unsubscribe = store.subscribe(() => {})
    assert.equal(store.getSnapshot().settings.timezone, 'Europe/Paris')
    const expected: unknown = saved
    assert.equal(storage.getItem(CLOCK_SETTINGS_KEY), expected)
    unsubscribe()
  }
}).catch((error: unknown) => { throw error })

test('unavailable storage retains usable local controls and a stable server snapshot', () => {
  const unavailable = () => {
    throw new Error('Unavailable storage')
  }
  const store = createClockSettingsStore({ getItem: unavailable, setItem: unavailable })
  const server = store.getServerSnapshot()
  assert.ok(Object.is(store.getSnapshot(), server))
  const unsubscribe = store.subscribe(() => {})
  store.update({ timezone: 'America/New_York', format: '12', seconds: false })
  assert.deepEqual(store.getSnapshot().settings, { timezone: 'America/New_York', format: '12', seconds: false })
  assert.ok(Object.is(store.getServerSnapshot(), server))
  assert.equal(store.getSnapshot().ready, true)
  unsubscribe()
}).catch((error: unknown) => { throw error })

test('clock stores isolate each mounted application', () => {
  const first = createClockSettingsStore(memoryStorage())
  const second = createClockSettingsStore(memoryStorage())
  const firstUnsubscribe = first.subscribe(() => {})
  const secondUnsubscribe = second.subscribe(() => {})
  first.update({ timezone: 'Asia/Shanghai', seconds: false })
  assert.deepEqual(second.getSnapshot().settings, { timezone: 'local', format: '24', seconds: true })
  firstUnsubscribe()
  secondUnsubscribe()
}).catch((error: unknown) => { throw error })

test('clock listeners unsubscribe and resubscription preserves the restored snapshot', () => {
  const store = createClockSettingsStore(memoryStorage())
  let first = 0
  let second = 0
  const unsubscribeFirst = store.subscribe(() => {
    first++
  })
  const unsubscribeSecond = store.subscribe(() => {
    second++
  })
  store.update({ timezone: 'UTC' })
  unsubscribeFirst()
  store.update({ format: '12', seconds: false })
  assert.equal(first, 2)
  assert.equal(second, 2)
  const snapshot = store.getSnapshot()
  const unsubscribe = store.subscribe(() => {
    throw new Error('Resubscribing must not reset clock settings')
  })
  assert.ok(Object.is(store.getSnapshot(), snapshot))
  assert.deepEqual(snapshot.settings, { timezone: 'UTC', format: '12', seconds: false })
  unsubscribeSecond()
  unsubscribe()
}).catch((error: unknown) => { throw error })
