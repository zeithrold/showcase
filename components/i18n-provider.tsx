'use client'

import type { JSX, ReactNode } from 'react'
import type { Locale } from '@/lib/i18n'
import { useState } from 'react'
import { I18nextProvider } from 'react-i18next'
import { createShowcaseI18n } from '@/lib/i18n'

export function ShowcaseI18nProvider({ children, initialLocale = 'en' }: {
  children: ReactNode
  initialLocale?: Locale
}): JSX.Element {
  const [instance] = useState(() => createShowcaseI18n(initialLocale))
  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>
}
