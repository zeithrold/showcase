'use client'

import type { JSX } from 'react'
import { useSiteTranslation } from '@/components/i18n/use-site-translation'
import { getClockParts } from '@/lib/clock'

const MINI_DIAL_CLASS = [
  'mini-dial w-8 h-8 shrink-0 text-muted-foreground max-[520px]:w-[27px] max-[520px]:h-[27px]',
].join(' ')

const WORLD_CLOCKS_CLASS = [
  'world-clocks grid grid-cols-[130px_1fr_1fr_1fr] items-center gap-8 py-[25px] px-7 border-b',
  'border-border max-[1050px]:grid-cols-[110px_1fr_1fr_1fr] max-[1050px]:gap-5 max-[760px]:py-[23px]',
  'max-[760px]:px-[14px] max-[520px]:py-5 max-[520px]:px-[2px] max-[520px]:gap-[13px]',
  'max-[760px]:grid-cols-[repeat(auto-fit,_minmax(150px,_1fr))] max-[760px]:gap-5',
  'max-[520px]:grid-cols-[minmax(0,_1fr)]',
].join(' ')

const WORLD_CAPTION_CLASS = [
  'world-caption text-help tracking-[1.2px] leading-[1.7] text-muted-foreground whitespace-pre-line',
  'max-[760px]:hidden',
].join(' ')

const WORLD_CLOCK_CLASS = [
  'world-clock flex items-center gap-[13px] [&_>_div]:flex [&_>_div]:items-baseline [&_>_div]:gap-[14px]',
  'max-[760px]:gap-2 max-[760px]:[&_>_div]:flex-col max-[760px]:[&_>_div]:gap-[3px] min-w-0',
  'max-[520px]:[&_>_div]:flex-row max-[520px]:[&_>_div]:justify-between max-[520px]:[&_>_div]:flex-1',
].join(' ')

const WORLD_CITY_CLASS = [
  'world-city text-help text-muted-foreground whitespace-nowrap max-[520px]:text-help wrap-anywhere',
].join(' ')

const WORLD_TIME_CLASS = [
  'world-time text-body font-sans tabular-nums tracking-[-.2px] max-[520px]:text-body',
].join(' ')

const WORLD_OFFSET_CLASS = [
  'world-offset text-help text-muted-foreground ml-auto whitespace-nowrap max-[1050px]:hidden',
].join(' ')

const WORLD_CLOCKS = [
  { cityKey: 'city.tokyo', zone: 'Asia/Tokyo' },
  { cityKey: 'city.london', zone: 'Europe/London' },
  { cityKey: 'city.newYork', zone: 'America/New_York' },
] as const

function MiniDial({ hour, minute }: { hour: number, minute: number }): JSX.Element {
  return (
    <svg className={MINI_DIAL_CLASS} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1" opacity=".28" />
      <path
        d="M16 16V9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        transform={`rotate(${hour % 12 * 30 + minute / 2} 16 16)`}
      />
      <path
        d="M16 16V5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        transform={`rotate(${minute * 6} 16 16)`}
      />
      <circle cx="16" cy="16" r="1.5" fill="var(--accent-color)" />
    </svg>
  )
}

export function WorldClocks({ now }: { now: Date | null }): JSX.Element {
  const { t } = useSiteTranslation()
  return (
    <div
      className={WORLD_CLOCKS_CLASS}
      aria-label={t('world.label')}
    >
      <span className={WORLD_CAPTION_CLASS}>
        {t('world.caption')}
      </span>
      {WORLD_CLOCKS.map(({ cityKey, zone }) => {
        const world = now !== null ? getClockParts(now, zone) : null
        return (
          <div
            className={WORLD_CLOCK_CLASS}
            key={zone}
          >
            <MiniDial hour={world?.hour24 ?? 0} minute={Number(world?.minute ?? 0)} />
            <div>
              <span className={WORLD_CITY_CLASS}>
                {t(cityKey)}
              </span>
              <span className={WORLD_TIME_CLASS}>{world !== null ? `${world.hour}:${world.minute}` : '--:--'}</span>
            </div>
            <span className={WORLD_OFFSET_CLASS}>{world?.offset ?? ''}</span>
          </div>
        )
      })}
    </div>
  )
}
