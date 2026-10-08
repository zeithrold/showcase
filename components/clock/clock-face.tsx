'use client'

import type { JSX } from 'react'
import type { ClockParts, ClockPreferences } from '@/lib/clock'
import type { CopyKey } from '@/lib/i18n'
import { Globe2 } from 'lucide-react'
import { useSiteTranslation } from '@/components/i18n/use-site-translation'
import { SlidingDigit } from '@/components/sliding-digit'
import { formatClock, TIMEZONES } from '@/lib/clock'
import { usePreferences } from '@/lib/preferences-context'

const PROGRESS_TRACK_CLASS = ['progress-track relative h-[3px] bg-muted rounded-[2px]'].join(' ')

const CLOCK_COLON_CLASS = [
  'clock-colon w-[.3em] flex flex-col gap-[.20em] items-center pt-0 px-0 pb-[.01em] [&_i]:block',
  '[&_i]:w-[.045em] [&_i]:h-[.045em] [&_i]:rounded-full [&_i]:bg-[var(--clock-color)] [&_i]:opacity-[.32]',
].join(' ')

const CLOCK_DIGITS_CLASS = [
  'clock-digits flex justify-center items-center relative w-[fit-content] max-w-full mt-[17px] mx-auto',
  'mb-[9px] font-sans text-[length:clamp(92px,_11.8vw,_164px)] font-normal tabular-nums',
  'text-[var(--clock-color)] tracking-[0] leading-[1.12] max-[760px]:text-[length:11.9vw]',
  'max-[520px]:text-[length:15.8vw] max-[520px]:font-normal max-[520px]:mt-5 max-[520px]:mx-auto',
  'max-[520px]:mb-3',
].join(' ')

const CLOCK_PERIOD_CLASS = [
  'clock-period absolute left-[calc(100%_+_8px)] bottom-[26px] text-muted-foreground text-help',
  'font-medium tracking-[.6px] max-[760px]:text-help max-[760px]:left-[calc(100%_+_4px)]',
  'max-[760px]:bottom-[14px] max-[520px]:text-help max-[520px]:left-auto max-[520px]:right-[3px]',
  'max-[520px]:bottom-[-16px]',
].join(' ')

const CLOCK_FACE_CLASS = [
  'clock-face text-center pt-[30px] px-6 pb-[38px] max-[760px]:pt-[30px] max-[760px]:px-[18px]',
  'max-[760px]:pb-[34px] max-[520px]:pt-6 max-[520px]:px-[10px] max-[520px]:pb-[29px]',
].join(' ')

const CLOCK_LOCATION_CLASS = [
  'clock-location flex justify-center items-center gap-[7px] text-muted-foreground text-help',
  'tracking-[.2px] [&_>_span:first-of-type]:text-foreground max-[520px]:text-help max-[520px]:gap-[5px]',
  'max-[520px]:[&_svg]:w-[11px]',
].join(' ')

const CLOCK_DATE_CLASS = [
  'clock-date text-help tracking-[.2px] text-muted-foreground m-0 max-[520px]:text-help',
].join(' ')

const DAY_PROGRESS_CLASS = [
  'day-progress max-w-[650px] w-[calc(100%_-_112px)] mt-0 mx-auto mb-8 max-[760px]:w-[calc(100%_-_70px)]',
  'max-[520px]:w-[calc(100%_-_44px)] max-[520px]:mb-6',
].join(' ')

const PROGRESS_LABELS_CLASS = [
  'progress-labels flex justify-between items-center text-help tracking-[1.25px] text-muted-foreground',
  'mb-[11px] max-[520px]:text-help flex-wrap',
].join(' ')

const PROGRESS_PERCENT_CLASS = [
  'progress-percent tabular-nums text-help tracking-[.2px] text-foreground [&_>_span]:ml-[2px]',
  '[&_>_span]:text-muted-foreground max-[520px]:text-help',
].join(' ')

const PROGRESS_FILL_CLASS = ['progress-fill h-full bg-accent rounded-[inherit] [transition:width_1s_linear]'].join(' ')

const PROGRESS_ENDPOINTS_CLASS = [
  'progress-endpoints flex justify-between text-help text-muted-foreground mt-[9px] tabular-nums',
].join(' ')

type ClockFaceProps = {
  now: Date | null
  parts: ClockParts | null
  timezone: string
}

function DigitPair({ value, seconds = false }: { value: string, seconds?: boolean }): JSX.Element {
  return (
    <span className={`digit-pair flex ${seconds ? 'seconds-pair text-[var(--seconds-color)]' : ''}`}>
      <SlidingDigit value={value.charAt(0)} />
      <SlidingDigit value={value.charAt(1)} />
    </span>
  )
}

function Colon({ seconds = false }: { seconds?: boolean }): JSX.Element {
  const className = [
    CLOCK_COLON_CLASS,
    seconds ? 'seconds-colon [&_i]:bg-[var(--seconds-color)] [&_i]:opacity-[.55]' : '',
  ].join(' ')
  return (
    <span className={className} aria-hidden="true">
      <i />
      <i />
    </span>
  )
}

function getCity(timezone: string, preferences: ClockPreferences): CopyKey | undefined {
  const selected = preferences.timezone === 'local' ? timezone : preferences.timezone
  return TIMEZONES.find(zone => zone.value === selected)?.cityKey
}

type ClockDigitsProps = {
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
      role="timer"
      aria-live="off"
      className={`${CLOCK_DIGITS_CLASS} ${preferences.seconds ? '' : 'without-seconds'}`}
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
        <span
          className={CLOCK_PERIOD_CLASS}
          aria-hidden="true"
        >
          {digits.period}
        </span>
      )}
    </time>
  )
}

export function ClockFace({ now, parts, timezone }: ClockFaceProps): JSX.Element {
  const { t } = useSiteTranslation()
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
    <div className={CLOCK_FACE_CLASS}>
      <div className={CLOCK_LOCATION_CLASS}>
        <Globe2 size={13} />
        <span>{ready ? city : t('city.local')}</span>
        <span className="location-separator opacity-[.4] my-0 mx-[3px]">/</span>
        <span>{parts?.offset ?? 'UTC'}</span>
      </div>
      <ClockDigits now={now} parts={parts} preferences={preferences} label={label} />
      <p className={CLOCK_DATE_CLASS}>{parts?.dateLabel ?? t('clock.wait')}</p>
    </div>
  )
}

export function DayProgress({ parts }: { parts: ClockParts | null }): JSX.Element {
  const { t } = useSiteTranslation()
  return (
    <div className={DAY_PROGRESS_CLASS}>
      <div className={PROGRESS_LABELS_CLASS}>
        <span>{t('clock.progress')}</span>
        <span className={PROGRESS_PERCENT_CLASS}>
          {parts?.progress.toFixed(1) ?? '0.0'}
          <span>%</span>
        </span>
      </div>
      <div
        className={PROGRESS_TRACK_CLASS}
        role="progressbar"
        aria-label={t('clock.progressLabel')}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Number(parts?.progress.toFixed(1) ?? 0)}
      >
        <div className={PROGRESS_FILL_CLASS} style={{ width: `${parts?.progress ?? 0}%` }} />
      </div>
      <div className={PROGRESS_ENDPOINTS_CLASS}>
        <span>00:00</span>
        <span>24:00</span>
      </div>
    </div>
  )
}
