'use client'

import type { JSX, ReactNode } from 'react'

import type { Locale } from '@/lib/i18n'
import { createInstance } from 'i18next'
import { useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import { LOCALES, resources } from '@/lib/i18n'

export function ShowcaseI18nProvider({ children, initialLocale = 'en' }: {
  children: ReactNode
  initialLocale?: Locale
}): JSX.Element {
  const [instance] = useState(() => {
    const i18n = createInstance()
    i18n.init({
      lng: initialLocale,
      fallbackLng: 'en',
      supportedLngs: [
        ...LOCALES,
      ],
      resources,
      keySeparator: false,
      initAsync: false,
      interpolation: { escapeValue: false },
      react: { useSuspense: false },
    }).catch((error: unknown) => console.error('Could not initialize translations', error))
    return i18n
  })
  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>
}
