'use client'

import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { AppearanceMenu, useFrontendPreferences } from './ui/ztd-me/client.ts'

export function PalettePicker(): JSX.Element {
  const { t } = useTranslation()
  const { preferences } = useFrontendPreferences()
  return (
    <div className="appearance-settings">
      <span>{t('settings.palette')}</span>
      <AppearanceMenu />
      <span className="palette-name">{t(`palette.${preferences.palette}`)}</span>
    </div>
  )
}
