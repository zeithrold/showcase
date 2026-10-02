'use client'

import type { JSX } from 'react'
import { Check, Copy, Maximize2, Minimize2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ClockFace, DayProgress } from '@/components/clock/clock-face'
import { ClockIntro, ClockNotes } from '@/components/clock/clock-notes'
import { ClockSettings } from '@/components/clock/clock-settings'
import { WorldClocks } from '@/components/clock/world-clocks'
import { IconButton, SiteShell } from '@/components/site-shell'
import { getClockParts, resolveTimezone } from '@/lib/clock'
import { usePreferences } from '@/lib/preferences-context'
import { useCopyTime, useFullscreen } from '@/lib/use-clock-actions'
import { useCurrentTime } from '@/lib/use-current-time'

function ClockStage({ now }: { now: Date | null }): JSX.Element {
  const { t } = useTranslation()
  const { preferences } = usePreferences()
  const { focused, stageElement, setStageElement, toggleFullscreen } = useFullscreen()
  const timezone = resolveTimezone(preferences.timezone)
  const parts = now === null ? null : getClockParts(now, timezone, preferences.format, preferences.locale)
  const { copyStatus, copyTime } = useCopyTime(now, timezone, preferences)
  const copyLabel = copyStatus === 'copied' ? 'clock.copied' : 'clock.copyUnavailable'
  return (
    <section
      id="clock"
      ref={setStageElement}
      className="clock-stage"
      data-focused={focused}
      aria-label={t('clock.name')}
    >
      <div className="clock-topline">
        <span className="live-label">
          <span className="live-dot" />
          {t('clock.live')}
        </span>
        <div className="clock-actions">
          <IconButton label={t('clock.copy')} onClick={() => { copyTime().catch(console.error) }}>
            {copyStatus === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          </IconButton>
          <IconButton
            label={t(focused ? 'clock.exitFullscreen' : 'clock.fullscreen')}
            onClick={() => { toggleFullscreen().catch(console.error) }}
          >
            {focused ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </IconButton>
          {focused && <span className="escape-hint">{t('clock.escape')}</span>}
        </div>
      </div>
      <ClockFace now={now} parts={parts} timezone={timezone} />
      <DayProgress parts={parts} />
      <ClockSettings container={focused ? stageElement : undefined} />
      <span className="copy-message" role="status">{copyStatus === '' ? '' : t(copyLabel)}</span>
    </section>
  )
}

export function ClockPage(): JSX.Element {
  const { t } = useTranslation()
  const now = useCurrentTime()
  return (
    <SiteShell>
      <ClockIntro />
      <section className="collection" aria-label={t('clock.name')}>
        <ClockStage now={now} />
        <WorldClocks now={now} />
      </section>
      <ClockNotes />
    </SiteShell>
  )
}
