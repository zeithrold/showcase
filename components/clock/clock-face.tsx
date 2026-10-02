'use client'

import type { JSX } from 'react'
import type { ClockParts, ClockPreferences } from '@/lib/clock'
import { Globe2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SlidingDigit } from '@/components/sliding-digit'
import { formatClock, TIMEZONES } from '@/lib/clock'
import { usePreferences } from '@/lib/preferences-context'

interface ClockFaceProps {
  now: Date | null
  parts: ClockParts | null
  timezone: string
}

function DigitPair({ value, seconds = false }: { value: string, seconds?: boolean }): JSX.Element {
  return (
    <span className={`digit-pair${seconds ? ' seconds-pair' : ''}`}>
      <SlidingDigit value={value.charAt(0)} />
      <SlidingDigit value={value.charAt(1)} />
    </span>
  )
}

function Colon({ seconds = false }: { seconds?: boolean }): JSX.Element {
  return (
    <span className={`clock-colon${seconds ? ' seconds-colon' : ''}`} aria-hidden="true">
      <i />
      <i />
    </span>
  )
}

function getCity(timezone: string, preferences: ClockPreferences): string | undefined {
  const selected = preferences.timezone === 'local' ? timezone : preferences.timezone
  return TIMEZONES.find(zone => zone.value === selected)?.cityKey
}

interface ClockDigitsProps {
  now: Date | null
  parts: ClockParts | null
  preferences: ClockPreferences
  label: string
}

const EMPTY_DIGITS = { hour: '--', minute: '--', second: '--', period: '--' }

function ClockDigits({ now, parts, preferences, label }: ClockDigitsProps): JSX.Element {
  const digits = parts ?? EMPTY_DIGITS
  return (
    <time
      className={`clock-digits ${preferences.seconds ? '' : 'without-seconds'}`}
      dateTime={now?.toISOString()}
      aria-label={label}
    >
      <DigitPair value={digits.hour} />
      <Colon />
      <DigitPair value={digits.minute} />
      {preferences.seconds && (
        <>
          <Colon seconds />
          <DigitPair value={digits.second} seconds />
        </>
      )}
      {preferences.format === '12' && (
        <span className="clock-period" aria-hidden="true">
          {digits.period}
        </span>
      )}
    </time>
  )
}

export function ClockFace({ now, parts, timezone }: ClockFaceProps): JSX.Element {
  const { t } = useTranslation()
  const { preferences, ready } = usePreferences()
  const cityKey = getCity(timezone, preferences)
  const city = cityKey === undefined
    ? timezone.split('/').at(-1)?.replaceAll('_', ' ') ?? t('city.local')
    : t(cityKey)
  const label = now === null
    ? t('clock.loading')
    : t('clock.label', {
        time: formatClock(now, timezone, preferences.format, preferences.seconds, preferences.locale),
        city,
      })
  return (
    <div className="clock-face">
      <div className="clock-location">
        <Globe2 size={13} />
        <span>{ready ? city : t('city.local')}</span>
        <span className="location-separator">/</span>
        <span>{parts?.offset ?? 'UTC'}</span>
      </div>
      <ClockDigits now={now} parts={parts} preferences={preferences} label={label} />
      <p className="clock-date">{parts?.dateLabel ?? t('clock.wait')}</p>
    </div>
  )
}

export function DayProgress({ parts }: { parts: ClockParts | null }): JSX.Element {
  const { t } = useTranslation()
  return (
    <div className="day-progress">
      <div className="progress-labels">
        <span>{t('clock.progress')}</span>
        <span className="progress-percent">
          {parts?.progress.toFixed(1) ?? '0.0'}
          <span>%</span>
        </span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label={t('clock.progressLabel')}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Number(parts?.progress.toFixed(1) ?? 0)}
      >
        <div className="progress-fill" style={{ width: `${parts?.progress ?? 0}%` }} />
      </div>
      <div className="progress-endpoints">
        <span>00:00</span>
        <span>24:00</span>
      </div>
    </div>
  )
}
