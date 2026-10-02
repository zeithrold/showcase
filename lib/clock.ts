import type { Locale } from './i18n.ts'
import type { Palette } from './palettes.ts'
import { isLocale } from './i18n.ts'
import { PALETTES } from './palettes.ts'

export const TIMEZONES = [
  { value: 'local', labelKey: 'timezone.local', cityKey: 'city.local' },
  { value: 'Asia/Shanghai', labelKey: 'city.shanghai', cityKey: 'city.shanghai' },
  { value: 'Asia/Tokyo', labelKey: 'city.tokyo', cityKey: 'city.tokyo' },
  { value: 'Europe/London', labelKey: 'city.london', cityKey: 'city.london' },
  { value: 'America/New_York', labelKey: 'city.newYork', cityKey: 'city.newYork' },
  { value: 'Europe/Paris', labelKey: 'city.paris', cityKey: 'city.paris' },
  { value: 'UTC', labelKey: 'timezone.utc', cityKey: 'city.utc' },
] as const

export type Timezone = (typeof TIMEZONES)[number]['value']
export type ClockFormat = '24' | '12'
export interface ClockPreferences {
  timezone: Timezone
  format: ClockFormat
  seconds: boolean
  theme: 'light' | 'dark'
  locale: Locale
  palette: Palette
}
export interface ClockParts {
  hour: string
  minute: string
  second: string
  hour24: number
  period: string
  progress: number
  dateLabel: string
  offset: string
}
export const DEFAULT_PREFERENCES: ClockPreferences = {
  timezone: 'local',
  format: '24',
  seconds: true,
  theme: 'light',
  locale: 'en',
  palette: 'terracotta',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function isTimezone(value: unknown): value is Timezone {
  return TIMEZONES.some(zone => zone.value === value)
}

function isPalette(value: unknown): value is Palette {
  return PALETTES.some(palette => palette.id === value)
}

export function readPreferences(value: unknown, fallbackLocale: Locale = 'en'): ClockPreferences {
  const source = isRecord(value) ? value : {}
  return {
    timezone: isTimezone(source.timezone) ? source.timezone : 'local',
    format: source.format === '12' ? '12' : '24',
    seconds: typeof source.seconds === 'boolean' ? source.seconds : true,
    theme: source.theme === 'dark' ? 'dark' : 'light',
    locale: isLocale(source.locale) ? source.locale : fallbackLocale,
    palette: isPalette(source.palette) ? source.palette : 'terracotta',
  }
}

export function resolveTimezone(timezone: Timezone): string {
  return timezone === 'local' ? new Intl.DateTimeFormat().resolvedOptions().timeZone : timezone
}

function getPeriod(date: Date, timezone: string, locale: Locale, hour24: number): string {
  const parts = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : locale, {
    timeZone: timezone,
    hour: 'numeric',
    hour12: true,
  }).formatToParts(date)
  return parts.find(part => part.type === 'dayPeriod')?.value ?? (hour24 >= 12 ? 'PM' : 'AM')
}

function getOffset(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'longOffset',
  }).formatToParts(date)
  return parts.find(part => part.type === 'timeZoneName')?.value.replace('GMT', 'UTC') ?? 'UTC'
}

export function getClockParts(
  date: Date,
  timezone: string,
  format: ClockFormat = '24',
  locale: Locale = 'en',
): ClockParts {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value ?? '00'
  const hour24 = Number(get('hour'))
  const minute = get('minute')
  const second = get('second')
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12
  const hour = String(format === '12' ? hour12 : hour24).padStart(2, '0')
  const elapsed = hour24 * 3600 + Number(minute) * 60 + Number(second)
  return {
    hour,
    minute,
    second,
    hour24,
    period: getPeriod(date, timezone, locale, hour24),
    progress: elapsed / 86400 * 100,
    dateLabel: new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : locale, {
      timeZone: timezone,
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date),
    offset: getOffset(date, timezone),
  }
}

// Retain the positional API, grouping the optional display settings in a typed tail.
export function formatClock(
  date: Date,
  timezone: string,
  format: ClockFormat,
  ...display: [seconds: boolean, locale?: Locale]
): string {
  const [seconds, locale = 'en'] = display
  const parts = getClockParts(date, timezone, format, locale)
  const time = `${parts.hour}:${parts.minute}${seconds ? `:${parts.second}` : ''}`
  if (format === '24') {
    return time
  }
  return locale === 'zh-CN' ? `${parts.period} ${time}` : `${time} ${parts.period}`
}
