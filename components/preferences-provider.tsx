'use client'

import type { JSX, ReactNode } from 'react'
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { useSiteTranslation } from '@/components/i18n/use-site-translation'
import { TooltipProvider } from '@/components/ui/tooltip'
import { createClockSettingsStore } from '@/lib/clock-settings-store'
import { applyShowcaseLocale } from '@/lib/i18n'
import { PreferencesContext } from '@/lib/preferences-context'
import { useFrontendPreferences } from './ui/ztd-me/client.ts'

export function PreferencesProvider({ children }: { children: ReactNode }): JSX.Element {
  const { i18n } = useSiteTranslation()
  const frontend = useFrontendPreferences()
  const [store] = useState(() => createClockSettingsStore({
    getItem: key => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
  }))
  const { settings, ready } = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot)
  const { locale, palette } = frontend.preferences
  const theme = frontend.resolvedMode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
  useEffect(() => {
    applyShowcaseLocale(i18n, locale)
  }, [locale, i18n])
  const value = useMemo(() => ({
    preferences: { ...settings, theme, locale, palette },
    ready,
    update: store.update,
  }), [
    settings,
    theme,
    locale,
    palette,
    ready,
    store,
  ])
  return (
    <PreferencesContext value={value}>
      <TooltipProvider delayDuration={250}>{children}</TooltipProvider>
    </PreferencesContext>
  )
}
