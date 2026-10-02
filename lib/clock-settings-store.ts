import type { ClockSettings } from './clock-settings.ts'
import type { PreferenceStorage } from './preferences-store.ts'
import { DEFAULT_CLOCK_SETTINGS, readClockSettings } from './clock-settings.ts'

export const CLOCK_SETTINGS_KEY = 'showcase.clock.settings.v1'
const LEGACY_KEY = 'showcase.clock.v1'
const SERVER_SNAPSHOT = { settings: DEFAULT_CLOCK_SETTINGS, ready: false }
type Snapshot = typeof SERVER_SNAPSHOT

function readStorage(storage: PreferenceStorage, key: string): unknown {
  try {
    const value = storage.getItem(key)
    return value === null || value === '' ? null : JSON.parse(value) as unknown
  }
  catch {
    return null
  }
}

function restoreSettings(storage: PreferenceStorage): ClockSettings {
  const current = readStorage(storage, CLOCK_SETTINGS_KEY)
  if (typeof current === 'object' && current !== null && 'version' in current && current.version === 1) {
    return readClockSettings(current)
  }
  return readClockSettings(readStorage(storage, LEGACY_KEY))
}

export function createClockSettingsStore(storage: PreferenceStorage): {
  subscribe: (listener: () => void) => () => void
  getSnapshot: () => Snapshot
  getServerSnapshot: () => Snapshot
  update: (values: Partial<ClockSettings>) => void
} {
  let snapshot = SERVER_SNAPSHOT
  const listeners = new Set<() => void>()
  const publish = (settings: ClockSettings) => {
    snapshot = { settings, ready: true }
    for (const listener of listeners) {
      listener()
    }
  }
  return {
    getSnapshot: () => snapshot,
    getServerSnapshot: () => SERVER_SNAPSHOT,
    subscribe: (listener) => {
      listeners.add(listener)
      if (!snapshot.ready) {
        publish(restoreSettings(storage))
      }
      return () => {
        listeners.delete(listener)
      }
    },
    update: (values) => {
      const settings = readClockSettings({ ...snapshot.settings, ...values })
      try {
        storage.setItem(CLOCK_SETTINGS_KEY, JSON.stringify({ version: 1, ...settings }))
      }
      catch { /* Clock settings remain usable without storage. */ }
      publish(settings)
    },
  }
}
