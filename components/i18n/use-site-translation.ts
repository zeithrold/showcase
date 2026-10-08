'use client'

import type { i18n } from 'i18next'
import type { ShowcaseTranslation } from '@/lib/i18n'
import { use } from 'react'
import { I18nContext } from 'react-i18next'
import { showcaseTranslation } from '@/lib/i18n'
import { useFrontendPreferences } from '../ui/ztd-me/client.ts'

function requireInstance(context: { i18n: i18n } | undefined): i18n {
  if (context === undefined) {
    throw new Error('useSiteTranslation requires the root I18nextProvider')
  }
  return context.i18n
}

export function useSiteTranslation(): { t: ShowcaseTranslation, i18n: i18n } {
  const instance = requireInstance(use(I18nContext))
  const { preferences: { locale } } = useFrontendPreferences()
  return { t: showcaseTranslation(instance, locale), i18n: instance }
}
