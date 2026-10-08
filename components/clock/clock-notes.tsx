'use client'

import type { JSX } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useSiteTranslation } from '@/components/i18n/use-site-translation'

const EYEBROW_CLASS_1 = ['eyebrow text-help font-medium tracking-[1.7px] text-muted-foreground'].join(' ')

const NOTE_INDEX_CLASS = ['note-index text-muted-foreground text-help tracking-[1.1px]'].join(' ')

const NOTE_INDEX_CLASS_2 = ['note-index text-muted-foreground text-help tracking-[1.1px]'].join(' ')

const TOOL_INTRO_CLASS = [
  'tool-intro pt-9 px-0 pb-10 [&_.intro-eyebrow]:mb-[13px] [&_h1]:text-[length:44px]',
  '[&_h1]:tracking-[-1.8px] max-[760px]:[&_h1]:text-[length:38px] max-[520px]:[&_h1]:text-[length:34px]',
  'max-[520px]:pt-[25px] max-[520px]:px-0 max-[520px]:pb-[30px]',
].join(' ')

const BACK_LINK_CLASS = [
  'back-link inline-flex items-center gap-2 text-control text-muted-foreground hover:text-accent',
].join(' ')

const TOOL_INTRO_BODY_CLASS = [
  'tool-intro-body flex justify-between items-end gap-10 mt-[30px] [&_>_p]:max-w-[290px] [&_>_p]:mt-0',
  '[&_>_p]:mx-0 [&_>_p]:mb-[2px] [&_>_p]:text-muted-foreground [&_>_p]:text-body [&_>_p]:leading-[1.9]',
  'max-[760px]:block max-[760px]:mt-[26px] max-[760px]:[&_>_p]:mt-4 max-[760px]:[&_>_p]:max-w-105',
].join(' ')

const EYEBROW_CLASS = [
  'eyebrow intro-eyebrow text-help font-medium tracking-[1.7px] text-muted-foreground flex items-center',
  'gap-2 mt-0 mx-0 mb-5 max-[520px]:mb-4 max-[520px]:text-help max-[520px]:tracking-[1.4px]',
].join(' ')

const FIELD_NOTES_CLASS = ['field-notes mt-[63px] mx-0 mb-[65px] max-[760px]:my-[45px] max-[760px]:mx-0'].join(' ')

const NOTES_HEADING_CLASS = [
  'notes-heading flex items-center gap-5 [&_.eyebrow]:text-help [&_.eyebrow]:whitespace-nowrap',
].join(' ')

const NOTES_GRID_CLASS = [
  'notes-grid grid grid-cols-[1fr_1fr] gap-25 mt-[29px] max-[760px]:gap-10 max-[520px]:grid-cols-[1fr]',
  'max-[520px]:gap-[25px] max-[520px]:mt-6',
].join(' ')

const NOTE_CLASS = [
  'note [&_h3]:font-sans [&_h3]:text-[length:19px] [&_h3]:font-medium [&_h3]:tracking-[-.4px]',
  '[&_h3]:mt-[11px] [&_h3]:mx-0 [&_h3]:mb-[10px] [&_p]:text-body [&_p]:leading-[1.9]',
  '[&_p]:text-muted-foreground [&_p]:m-0 max-[520px]:[&_h3]:text-control max-[520px]:[&_h3]:mt-2',
  'max-[520px]:[&_p]:text-body wrap-anywhere [&_p]:max-w-[65ch]',
].join(' ')

const NOTE_CLASS_1 = [
  'note [&_h3]:font-sans [&_h3]:text-[length:19px] [&_h3]:font-medium [&_h3]:tracking-[-.4px]',
  '[&_h3]:mt-[11px] [&_h3]:mx-0 [&_h3]:mb-[10px] [&_p]:text-body [&_p]:leading-[1.9]',
  '[&_p]:text-muted-foreground [&_p]:m-0 max-[520px]:[&_h3]:text-control max-[520px]:[&_h3]:mt-2',
  'max-[520px]:[&_p]:text-body wrap-anywhere [&_p]:max-w-[65ch]',
].join(' ')

export function ClockIntro(): JSX.Element {
  const { t } = useSiteTranslation()
  return (
    <section
      className={TOOL_INTRO_CLASS}
      aria-labelledby="clock-heading"
    >
      <Link
        href="/"
        className={BACK_LINK_CLASS}
      >
        <ArrowLeft size={14} />
        {t('pages.back')}
      </Link>
      <div className={TOOL_INTRO_BODY_CLASS}>
        <div>
          <p className={EYEBROW_CLASS}>
            {t('pages.pageNumber', { number: '01' })}
            {' '}
            /
            {' '}
            {t('collection.category')}
          </p>
          <h1 id="clock-heading">{t('collection.title')}</h1>
        </div>
        <p>{t('pages.clock.description')}</p>
      </div>
    </section>
  )
}

export function ClockNotes(): JSX.Element {
  const { t } = useSiteTranslation()
  return (
    <section className={FIELD_NOTES_CLASS} aria-label={t('notes.label')}>
      <div className={NOTES_HEADING_CLASS}>
        <span className={EYEBROW_CLASS_1}>{t('notes.heading')}</span>
        <span className="notes-line h-px w-full bg-border" />
      </div>
      <div className={NOTES_GRID_CLASS}>
        <div className={NOTE_CLASS}>
          <span className={NOTE_INDEX_CLASS}>{t('notes.interactionIndex')}</span>
          <h3>{t('notes.interactionTitle')}</h3>
          <p>{t('notes.interactionBody')}</p>
        </div>
        <div className={NOTE_CLASS_1}>
          <span className={NOTE_INDEX_CLASS_2}>{t('notes.everydayIndex')}</span>
          <h3>{t('notes.everydayTitle')}</h3>
          <p>{t('notes.everydayBody')}</p>
        </div>
      </div>
    </section>
  )
}
