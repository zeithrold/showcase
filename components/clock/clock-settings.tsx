'use client'

import type { JSX } from 'react'
import { Globe2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PalettePicker } from '@/components/palette-picker'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { isTimezone, TIMEZONES } from '@/lib/clock'
import { usePreferences } from '@/lib/preferences-context'

function TimezoneSetting({ container }: { container?: HTMLElement | null }): JSX.Element {
  const { t } = useTranslation()
  const { preferences, update } = usePreferences()
  const changeTimezone = (value: string) => {
    if (isTimezone(value)) {
      update({ timezone: value })
    }
  }
  return (
    <div className="timezone-setting">
      <label htmlFor="timezone">{t('settings.timezone')}</label>
      <Select value={preferences.timezone} onValueChange={changeTimezone}>
        <SelectTrigger id="timezone" className="timezone-select">
          <Globe2 size={14} />
          <SelectValue />
        </SelectTrigger>
        <SelectContent container={container}>
          {TIMEZONES.map(zone => <SelectItem key={zone.value} value={zone.value}>{t(zone.labelKey)}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}

function FormatSetting(): JSX.Element {
  const { t } = useTranslation()
  const { preferences, update } = usePreferences()
  return (
    <div className="format-setting">
      <span id="format-label">{t('settings.format')}</span>
      <div className="format-toggle" role="group" aria-labelledby="format-label">
        <Button variant="ghost" aria-pressed={preferences.format === '24'} onClick={() => update({ format: '24' })}>
          {t('settings.24')}
        </Button>
        <Button variant="ghost" aria-pressed={preferences.format === '12'} onClick={() => update({ format: '12' })}>
          {t('settings.12')}
        </Button>
      </div>
    </div>
  )
}

export function ClockSettings({ container }: { container?: HTMLElement | null }): JSX.Element {
  const { t } = useTranslation()
  const { preferences, update } = usePreferences()
  return (
    <div className="clock-controls">
      <div className="clock-settings">
        <TimezoneSetting container={container} />
        <FormatSetting />
        <div className="seconds-setting">
          <label htmlFor="show-seconds">{t('settings.seconds')}</label>
          <Switch id="show-seconds" checked={preferences.seconds} onCheckedChange={seconds => update({ seconds })} />
        </div>
        <span className="settings-note">
          <span className="motion-icon" aria-hidden="true">↥</span>
          {' '}
          {t('settings.motion')}
        </span>
      </div>
      <PalettePicker />
    </div>
  )
}
