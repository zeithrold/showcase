'use client'

import type { JSX } from 'react'
import { AppearanceMenu, useFrontendPreferences } from '@ztd-me/frontend/client'
import { useTranslation } from 'react-i18next'

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
