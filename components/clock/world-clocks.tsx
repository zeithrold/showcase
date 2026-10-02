'use client'

import type { JSX } from 'react'
import { useTranslation } from 'react-i18next'
import { getClockParts } from '@/lib/clock'

const WORLD_CLOCKS = [
  { cityKey: 'city.tokyo', zone: 'Asia/Tokyo' },
  { cityKey: 'city.london', zone: 'Europe/London' },
  { cityKey: 'city.newYork', zone: 'America/New_York' },
] as const

function MiniDial({ hour, minute }: { hour: number, minute: number }): JSX.Element {
  return (
    <svg className="mini-dial" viewBox="0 0 32 32" fill="none" aria-hidden="true">
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
  const { t } = useTranslation()
  return (
    <div className="world-clocks" aria-label={t('world.label')}>
      <span className="world-caption">{t('world.caption')}</span>
      {WORLD_CLOCKS.map(({ cityKey, zone }) => {
        const world = now !== null ? getClockParts(now, zone) : null
        return (
          <div className="world-clock" key={zone}>
            <MiniDial hour={world?.hour24 ?? 0} minute={Number(world?.minute ?? 0)} />
            <div>
              <span className="world-city">{t(cityKey)}</span>
              <span className="world-time">{world !== null ? `${world.hour}:${world.minute}` : '--:--'}</span>
            </div>
            <span className="world-offset">{world?.offset ?? ''}</span>
          </div>
        )
      })}
    </div>
  )
}
