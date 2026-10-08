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
export type ClockSettings = {
  timezone: Timezone
  format: ClockFormat
  seconds: boolean
}

export const DEFAULT_CLOCK_SETTINGS: ClockSettings = {
  timezone: 'local',
  format: '24',
  seconds: true,
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function isTimezone(value: unknown): value is Timezone {
  return TIMEZONES.some(zone => zone.value === value)
}

export function readClockSettings(value: unknown): ClockSettings {
  const source = isRecord(value) ? value : {}
  return {
    timezone: isTimezone(source.timezone) ? source.timezone : 'local',
    format: source.format === '12' ? '12' : '24',
    seconds: typeof source.seconds === 'boolean' ? source.seconds : true,
  }
}
