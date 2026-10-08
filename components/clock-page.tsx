'use client'

import type { JSX } from 'react'
import { Check, Copy, Maximize2, Minimize2 } from 'lucide-react'
import { ClockFace, DayProgress } from '@/components/clock/clock-face'
import { ClockIntro, ClockNotes } from '@/components/clock/clock-notes'
import { ClockSettings } from '@/components/clock/clock-settings'
import { WorldClocks } from '@/components/clock/world-clocks'
import { useSiteTranslation } from '@/components/i18n/use-site-translation'
import { IconButton, SiteShell } from '@/components/site-shell'
import { getClockParts, resolveTimezone } from '@/lib/clock'
import { usePreferences } from '@/lib/preferences-context'
import { useCopyTime, useFullscreen } from '@/lib/use-clock-actions'
import { useCurrentTime } from '@/lib/use-current-time'

const CLOCK_STAGE_CLASS = [
  'clock-stage relative overflow-hidden bg-card border border-border rounded-[20px]',
  'shadow-[0_8px_40px_var(--clock-shadow)] max-[520px]:rounded-[14px]',
].join(' ')

const CLOCK_TOPLINE_CLASS = [
  'clock-topline flex justify-between items-center pt-[22px] px-[27px] pb-0 max-[760px]:pt-[17px]',
  'max-[760px]:px-[18px] max-[760px]:pb-0 flex-wrap',
].join(' ')

const LIVE_LABEL_CLASS = [
  'live-label flex items-center gap-2 text-help tracking-[1.7px] text-muted-foreground',
  'max-[520px]:text-help max-[520px]:tracking-[1.1px]',
].join(' ')

const LIVE_DOT_CLASS = [
  'live-dot w-[5px] h-[5px] rounded-full bg-accent',
  'shadow-[0_0_0_3px_color-mix(in_srgb,_var(--ztd-accent)_5%,_transparent)]',
].join(' ')

const CLOCK_ACTIONS_CLASS = [
  'clock-actions flex gap-[3px] items-center max-[520px]:gap-0 max-[520px]:[&_.icon-button]:w-[29px]',
  'max-[520px]:[&_.icon-button]:h-[29px] [&_.icon-button]:min-h-11 [&_.icon-button]:min-w-11',
].join(' ')

const ESCAPE_HINT_CLASS = [
  'escape-hint text-help text-muted-foreground tracking-[.5px] my-0 mx-[10px] max-[520px]:hidden',
].join(' ')

const COPY_MESSAGE_CLASS = [
  'copy-message absolute right-25 top-[33px] text-help text-muted-foreground max-[520px]:right-5',
  'max-[520px]:top-[53px] max-[520px]:text-help',
].join(' ')

function ClockStage({ now }: { now: Date | null }): JSX.Element {
  const { t } = useSiteTranslation()
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
      className={CLOCK_STAGE_CLASS}
      data-focused={focused}
      aria-label={t('clock.name')}
    >
      <div className={CLOCK_TOPLINE_CLASS}>
        <span className={LIVE_LABEL_CLASS}>
          <span className={LIVE_DOT_CLASS} />
          {t('clock.live')}
        </span>
        <div className={CLOCK_ACTIONS_CLASS}>
          <IconButton label={t('clock.copy')} onClick={() => { copyTime().catch(console.error) }}>
            {copyStatus === 'copied' ? <Check size={16} /> : <Copy size={16} />}
          </IconButton>
          <IconButton
            label={t(focused ? 'clock.exitFullscreen' : 'clock.fullscreen')}
            onClick={() => { toggleFullscreen().catch(console.error) }}
          >
            {focused ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </IconButton>
          {focused && (
            <span className={ESCAPE_HINT_CLASS}>
              {t('clock.escape')}
            </span>
          )}
        </div>
      </div>
      <ClockFace now={now} parts={parts} timezone={timezone} />
      <DayProgress parts={parts} />
      <ClockSettings container={focused ? stageElement : undefined} />
      <span
        className={COPY_MESSAGE_CLASS}
        role="status"
      >
        {copyStatus === '' ? '' : t(copyLabel)}
      </span>
    </section>
  )
}

export function ClockPage(): JSX.Element {
  const { t } = useSiteTranslation()
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
