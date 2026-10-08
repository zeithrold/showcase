'use client'

import type { JSX } from 'react'
import { useSiteTranslation } from '@/components/i18n/use-site-translation'
import { AppearanceMenu, useFrontendPreferences } from './ui/ztd-me/client.ts'

const APPEARANCE_SETTINGS_CLASS = [
  'appearance-settings flex items-center gap-[14px] min-h-[53px] py-3 px-7 border-t border-border',
  'bg-[color-mix(in_srgb,_var(--ztd-muted)_24%,_var(--ztd-surface))] [&_>_span]:text-help',
  '[&_>_span]:text-muted-foreground max-[520px]:py-3 max-[520px]:px-4 max-[520px]:[&_>_span]:text-help',
  'flex-wrap max-[520px]:gap-3',
].join(' ')

export function PalettePicker(): JSX.Element {
  const { t } = useSiteTranslation()
  const { preferences } = useFrontendPreferences()
  return (
    <div className={APPEARANCE_SETTINGS_CLASS}>
      <span>{t('settings.palette')}</span>
      <AppearanceMenu />
      <span className="palette-name ml-auto max-[520px]:text-help">{t(`palette.${preferences.palette}`)}</span>
    </div>
  )
}
