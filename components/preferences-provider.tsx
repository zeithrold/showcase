'use client'

import type { JSX, ReactNode } from 'react'
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import { TooltipProvider } from '@/components/ui/tooltip'
import { PreferencesContext } from '@/lib/preferences-context'
import { createPreferencesStore } from '@/lib/preferences-store'

export function PreferencesProvider({ children }: { children: ReactNode }): JSX.Element {
  const { i18n } = useTranslation()
  const [store] = useState(() => createPreferencesStore({
    getItem: key => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
  }, typeof navigator === 'undefined' ? [] : navigator.languages))
  const { preferences, ready } = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot)

  useEffect(() => {
    if (!ready) {
      return
    }
    document.documentElement.classList.toggle('dark', preferences.theme === 'dark')
    document.documentElement.dataset.palette = preferences.palette
    document.documentElement.lang = preferences.locale
    i18n.changeLanguage(preferences.locale).catch((error: unknown) => console.error('Could not change language', error))
    const description = i18n.getFixedT(preferences.locale)('meta.description')
    document.querySelector('meta[name="description"]')?.setAttribute('content', description)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', description)
  }, [
    preferences,
    ready,
    i18n,
  ])

  const value = useMemo(() => ({ preferences, ready, update: store.update }), [
    preferences,
    ready,
    store,
  ])
  return (
    <PreferencesContext value={value}>
      <TooltipProvider delayDuration={250}>{children}</TooltipProvider>
    </PreferencesContext>
  )
}
