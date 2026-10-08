'use client'

import type { JSX } from 'react'
import { ArrowUp, Globe2 } from 'lucide-react'
import { useSiteTranslation } from '@/components/i18n/use-site-translation'
import { PalettePicker } from '@/components/palette-picker'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { isTimezone, TIMEZONES } from '@/lib/clock'
import { usePreferences } from '@/lib/preferences-context'

const TIMEZONE_SETTING_CLASS = [
  'timezone-setting flex items-center gap-[10px] max-[760px]:flex-col max-[760px]:items-start',
  'max-[760px]:gap-[7px] max-[520px]:min-w-0 max-[520px]:flex-row max-[520px]:justify-between',
  'max-[520px]:items-center',
].join(' ')

const TIMEZONE_SELECT_CLASS = [
  'timezone-select [&_>_svg]:w-3 [&_>_svg]:h-3 min-w-[142px] text-control py-0 px-[10px] shadow-none',
  'gap-[9px] bg-card [&_[data-slot="select-value"]]:mr-auto max-[520px]:h-[29px] max-[520px]:py-0',
  'max-[520px]:px-2 max-[520px]:gap-[6px] max-[520px]:[&_[data-slot="select-value"]]:text-control',
  'min-h-11 h-auto max-w-full max-[520px]:w-auto max-[520px]:max-w-[190px] max-[520px]:min-w-0',
].join(' ')

const FORMAT_SETTING_CLASS = [
  'format-setting flex items-center gap-[10px] [&_>_span]:text-help [&_>_span]:text-muted-foreground',
  'max-[760px]:flex-col max-[760px]:items-start max-[760px]:gap-[7px] max-[520px]:[&_>_span]:text-help',
  'max-[520px]:flex-row max-[520px]:justify-between max-[520px]:items-center',
].join(' ')

const FORMAT_TOGGLE_CLASS = [
  'format-toggle flex items-center border border-border rounded-[6px] p-[2px] bg-muted [&_>_button]:h-6',
  '[&_>_button]:py-0 [&_>_button]:px-[9px] [&_>_button]:text-control [&_>_button]:rounded-[4px]',
  '[&_>_button]:text-muted-foreground [&_>_button[aria-pressed="true"]]:bg-card',
  '[&_>_button[aria-pressed="true"]]:text-foreground',
  '[&_>_button[aria-pressed="true"]]:shadow-[0_1px_3px_var(--control-shadow)]',
  'max-[520px]:[&_>_button]:py-0 max-[520px]:[&_>_button]:px-[5px] max-[520px]:[&_>_button]:text-control',
  '[&_>_button]:min-h-11',
].join(' ')

const CLOCK_SETTINGS_CLASS = [
  'clock-settings flex items-center py-5 px-7 border-t border-border gap-7',
  'bg-[color-mix(in_srgb,_var(--ztd-muted)_24%,_var(--ztd-surface))] [&_label]:text-help',
  '[&_label]:text-muted-foreground max-[1050px]:gap-[22px] max-[760px]:justify-between',
  'max-[760px]:py-[17px] max-[760px]:px-5 max-[760px]:gap-[14px] max-[520px]:grid max-[520px]:gap-3',
  'max-[520px]:p-4 max-[520px]:[&_label]:text-help flex-wrap gap-y-5',
  'max-[520px]:grid-cols-[minmax(0,_1fr)]',
].join(' ')

const SECONDS_SETTING_CLASS = [
  'seconds-setting flex items-center gap-2.5 max-[760px]:flex-col max-[760px]:gap-3',
  'max-[520px]:flex-row max-[520px]:justify-between max-[520px]:items-center',
].join(' ')

const SETTINGS_NOTE_CLASS = [
  'settings-note text-help text-muted-foreground ml-auto flex gap-[7px] items-center whitespace-nowrap',
  'max-[1050px]:hidden',
].join(' ')

function TimezoneSetting({ container }: { container?: HTMLElement | null }): JSX.Element {
  const { t } = useSiteTranslation()
  const { preferences, update } = usePreferences()
  const changeTimezone = (value: string) => {
    if (isTimezone(value)) {
      update({ timezone: value })
    }
  }
  return (
    <div className={TIMEZONE_SETTING_CLASS}>
      <label htmlFor="timezone">{t('settings.timezone')}</label>
      <Select value={preferences.timezone} onValueChange={changeTimezone}>
        <SelectTrigger
          id="timezone"
          className={TIMEZONE_SELECT_CLASS}
        >
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
  const { t } = useSiteTranslation()
  const { preferences, update } = usePreferences()
  return (
    <div className={FORMAT_SETTING_CLASS}>
      <span id="format-label">{t('settings.format')}</span>
      <div
        className={FORMAT_TOGGLE_CLASS}
        role="group"
        aria-labelledby="format-label"
      >
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
  const { t } = useSiteTranslation()
  const { preferences, update } = usePreferences()
  return (
    <div className="clock-controls">
      <div className={CLOCK_SETTINGS_CLASS}>
        <TimezoneSetting container={container} />
        <FormatSetting />
        <div className={SECONDS_SETTING_CLASS}>
          <label htmlFor="show-seconds">{t('settings.seconds')}</label>
          <Switch id="show-seconds" checked={preferences.seconds} onCheckedChange={seconds => update({ seconds })} />
        </div>
        <span className={SETTINGS_NOTE_CLASS}>
          <ArrowUp className="motion-icon text-accent text-control" size={15} aria-hidden="true" />
          {' '}
          {t('settings.motion')}
        </span>
      </div>
      <PalettePicker />
    </div>
  )
}
