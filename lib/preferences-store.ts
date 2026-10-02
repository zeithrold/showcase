import type { ClockPreferences } from './clock.ts'
import { DEFAULT_PREFERENCES, readPreferences } from './clock.ts'
import { detectLocale } from './i18n.ts'

const PREFERENCES_KEY = 'showcase.clock.v1'
const SERVER_SNAPSHOT = { preferences: DEFAULT_PREFERENCES, ready: false }
type Snapshot = typeof SERVER_SNAPSHOT

export interface PreferenceStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

export interface PreferencesStore {
  subscribe: (listener: () => void) => () => void
  getSnapshot: () => Snapshot
  getServerSnapshot: () => Snapshot
  update: (values: Partial<ClockPreferences>) => void
}

function restorePreferences(storage: PreferenceStorage, languages: readonly string[]): ClockPreferences {
  const fallbackLocale = detectLocale(languages)
  try {
    const saved = storage.getItem(PREFERENCES_KEY)
    if (saved !== null && saved !== '') {
      const value: unknown = JSON.parse(saved)
      return readPreferences(value, fallbackLocale)
    }
  }
  catch { /* Storage is optional. */ }
  return { ...DEFAULT_PREFERENCES, locale: fallbackLocale }
}

export function createPreferencesStore(
  storage: PreferenceStorage,
  languages: readonly string[],
): PreferencesStore {
  let snapshot = SERVER_SNAPSHOT
  const listeners = new Set<() => void>()
  const publish = (preferences: ClockPreferences) => {
    try {
      storage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
    }
    catch { /* Storage is optional. */ }
    snapshot = { preferences, ready: true }
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
        publish(restorePreferences(storage, languages))
      }
      return () => {
        listeners.delete(listener)
      }
    },
    update: (values) => {
      const preferences = { ...snapshot.preferences, ...values }
      publish(preferences)
    },
  }
}
