'use client'

import type { JSX, ReactNode } from 'react'
import type { FrontendPreferences, PreferencePolicy } from './ui/ztd-me/index.ts'
import { useSyncExternalStore } from 'react'
import { ShowcaseI18nProvider } from '@/components/i18n-provider'
import { PreferencesProvider } from '@/components/preferences-provider'
import { FrontendProvider } from './ui/ztd-me/client.ts'

function subscribeFullscreen(listener: () => void): () => void {
  document.addEventListener('fullscreenchange', listener)
  return () => document.removeEventListener('fullscreenchange', listener)
}

function fullscreenContainer(): HTMLElement | null {
  const element = document.fullscreenElement
  return element instanceof HTMLElement ? element : null
}

export function FrontendAdapter({ initialPreferences, policy, children }: {
  initialPreferences: FrontendPreferences
  policy: PreferencePolicy
  children: ReactNode
}): JSX.Element {
  const portalContainer = useSyncExternalStore(subscribeFullscreen, fullscreenContainer, () => null)
  return (
    <FrontendProvider initialPreferences={initialPreferences} policy={policy} portalContainer={portalContainer}>
      <ShowcaseI18nProvider initialLocale={initialPreferences.locale}>
        <PreferencesProvider>{children}</PreferencesProvider>
      </ShowcaseI18nProvider>
    </FrontendProvider>
  )
}
