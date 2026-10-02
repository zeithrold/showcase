import type { PreferenceStorage } from '../lib/preferences-store.ts'
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readClockSettings } from '../lib/clock-settings.ts'
import { DEFAULT_PREFERENCES } from '../lib/clock.ts'
import { createPreferencesStore } from '../lib/preferences-store.ts'

function memoryStorage(saved: string | null = null): PreferenceStorage {
  let value = saved
  return {
    getItem: () => value,
    setItem: (_key, next) => { value = next },
  }
}

test('preferences hydrate from a stable server snapshot and normalize stored values', () => {
  const storage = memoryStorage(JSON.stringify({ timezone: 'UTC', format: '12', locale: 'unknown' }))
  const store = createPreferencesStore(storage, ['zh-CN'])
  const server = store.getServerSnapshot()
  assert.ok(Object.is(store.getSnapshot(), server))
  assert.equal(server.ready, false)
  let notifications = 0
  const unsubscribe = store.subscribe(() => {
    notifications++
  })
  const restored = store.getSnapshot()
  assert.equal(restored.ready, true)
  assert.deepEqual(restored.preferences, { ...DEFAULT_PREFERENCES, timezone: 'UTC', format: '12', locale: 'zh-CN' })
  assert.ok(Object.is(store.getSnapshot(), restored))
  assert.ok(Object.is(store.getServerSnapshot(), server))
  assert.equal(notifications, 1)
  assert.equal(storage.getItem('showcase.clock.v1'), JSON.stringify(restored.preferences))
  unsubscribe()
}).catch((error: unknown) => { throw error })

test('updates merge and persist and unsubscribed listeners stay silent', () => {
  const storage = memoryStorage()
  const store = createPreferencesStore(storage, ['en-US'])
  let first = 0
  let second = 0
  const unsubscribeFirst = store.subscribe(() => {
    first++
  })
  const unsubscribeSecond = store.subscribe(() => {
    second++
  })
  store.update({ palette: 'ocean', theme: 'dark' })
  unsubscribeFirst()
  store.update({ seconds: false })
  assert.equal(first, 2)
  assert.equal(second, 2)
  assert.deepEqual(store.getSnapshot().preferences, {
    ...DEFAULT_PREFERENCES,
    palette: 'ocean',
    theme: 'dark',
    seconds: false,
  })
  assert.equal(storage.getItem('showcase.clock.v1'), JSON.stringify(store.getSnapshot().preferences))
  unsubscribeSecond()
  const snapshot = store.getSnapshot()
  const unsubscribe = store.subscribe(() => {
    throw new Error('Resubscribing must not reset preferences')
  })
  assert.ok(Object.is(store.getSnapshot(), snapshot))
  unsubscribe()
}).catch((error: unknown) => { throw error })

test('corrupt and missing storage use browser-language defaults', () => {
  for (const saved of [
    null,
    '',
    '{broken',
    'null',
  ]) {
    const store = createPreferencesStore(memoryStorage(saved), ['zh-TW'])
    const unsubscribe = store.subscribe(() => {})
    assert.deepEqual(store.getSnapshot().preferences, { ...DEFAULT_PREFERENCES, locale: 'zh-CN' })
    unsubscribe()
  }
}).catch((error: unknown) => { throw error })

test('unavailable storage does not prevent hydration or updates', () => {
  const unavailable = () => {
    throw new Error('Storage unavailable')
  }
  const store = createPreferencesStore({ getItem: unavailable, setItem: unavailable }, ['en-US'])
  const unsubscribe = store.subscribe(() => {})
  assert.equal(store.getSnapshot().ready, true)
  store.update({ timezone: 'Asia/Tokyo' })
  assert.equal(store.getSnapshot().preferences.timezone, 'Asia/Tokyo')
  unsubscribe()
}).catch((error: unknown) => { throw error })

test('appearance and language updates preserve local clock controls', () => {
  const storage = memoryStorage(JSON.stringify({ timezone: 'Asia/Tokyo', format: '12', seconds: false }))
  const store = createPreferencesStore(storage, ['en'])
  const unsubscribe = store.subscribe(() => {})
  const before: unknown = readClockSettings(store.getSnapshot().preferences)
  store.update({ locale: 'zh-CN', theme: 'dark', palette: 'ocean' })
  assert.deepEqual(readClockSettings(store.getSnapshot().preferences), before)
  assert.deepEqual(readClockSettings(JSON.parse(storage.getItem('showcase.clock.v1') ?? '{}')), before)
  unsubscribe()
}).catch((error: unknown) => { throw error })

test('independent app stores keep server snapshots and local clock state isolated', () => {
  const first = createPreferencesStore(memoryStorage(JSON.stringify({ timezone: 'Asia/Tokyo' })), ['zh-CN'])
  const second = createPreferencesStore(memoryStorage(JSON.stringify({ timezone: 'UTC' })), ['en'])
  const server = second.getServerSnapshot()
  const unsubscribeFirst = first.subscribe(() => {})
  first.update({ format: '12', seconds: false })
  assert.ok(Object.is(second.getSnapshot(), server))
  const unsubscribeSecond = second.subscribe(() => {})
  assert.equal(second.getSnapshot().preferences.timezone, 'UTC')
  assert.equal(second.getSnapshot().preferences.format, '24')
  assert.ok(Object.is(first.getServerSnapshot(), server))
  unsubscribeFirst()
  unsubscribeSecond()
}).catch((error: unknown) => { throw error })
