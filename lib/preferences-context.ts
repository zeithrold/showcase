import type { ClockPreferences } from './clock'
import type { ClockSettings } from './clock-settings'
import { createContext, use } from 'react'

export type PreferencesContextValue = {
  preferences: ClockPreferences
  ready: boolean
  update: (values: Partial<ClockSettings>) => void
}

export const PreferencesContext = createContext<PreferencesContextValue | null>(null)

export function usePreferences(): PreferencesContextValue {
  const context = use(PreferencesContext)
  if (context === null) {
    throw new Error('usePreferences must be used inside PreferencesProvider')
  }
  return context
}
