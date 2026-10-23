'use client'

import type { JSX } from 'react'
import type { ClockParts } from '@/lib/clock'
import { ArrowDown, ArrowRight, Asterisk } from 'lucide-react'
import Link from 'next/link'
import { useSiteTranslation } from '@/components/i18n/use-site-translation'
import { PalettePicker } from '@/components/palette-picker'
import { SiteShell } from '@/components/site-shell'
import { SlidingDigit } from '@/components/sliding-digit'
import { getClockParts, resolveTimezone } from '@/lib/clock'
import { PAGES } from '@/lib/pages'
import { useCurrentTime } from '@/lib/use-current-time'

const previewDigitsStyle1 = [
  'preview-digits flex items-center font-sans tabular-nums text-[length:clamp(40px,4.4vw,60px)]',
  'leading-[1.12] tracking-[-.035em] max-[760px]:text-[length:52px] max-[360px]:text-[length:44px]',
].join(' ')

const pagePreviewStyle2 = [
  'page-preview relative flex flex-col justify-between min-h-78 overflow-hidden rounded-sm border',
  'border-border bg-background p-7 max-[760px]:min-h-64 max-[520px]:p-5',
].join(' ')

const previewCaptionStyle3 = [
  'preview-caption flex items-center justify-between gap-3 text-help text-muted-foreground',
  'tracking-[.08em]',
].join(' ')

const previewTicksStyle4 = [
  'preview-ticks flex justify-between mt-3 text-help text-muted-foreground font-mono',
].join(' ')

const pageEntryStyle5 = [
  'page-entry group grid grid-cols-[1.1fr_1fr] gap-12 items-center border-y border-border py-7',
  'no-underline max-[760px]:grid-cols-1 max-[760px]:gap-6 max-[760px]:py-5',
].join(' ')

const pageEntryMetaStyle6 = [
  'page-entry-meta flex flex-wrap items-center gap-3 text-help text-muted-foreground',
].join(' ')

const fontSansStyle7 = ['font-sans text-[length:27px] leading-[1.3] font-medium tracking-[-.035em] mt-5 mb-3'].join(' ')

const pageFeaturesStyle8 = [
  'page-features list-none flex flex-wrap gap-x-5 gap-y-2 p-0 mt-5 mb-6 text-help',
  'text-muted-foreground',
].join(' ')

const pageOpenStyle9 = [
  'page-open inline-flex min-h-11 items-center gap-6 text-control font-medium border-b border-border',
  'group-hover:border-accent',
].join(' ')

const textAccentStyle10 = [
  'text-accent transition-transform duration-200 group-hover:translate-x-1',
  'motion-reduce:transition-none',
].join(' ')

const introStyle11 = [
  'intro grid grid-cols-[1fr_260px] items-end gap-12 pt-16 pb-14 max-[760px]:grid-cols-1',
  'max-[760px]:gap-6 max-[760px]:pt-10 max-[760px]:pb-10',
].join(' ')

const eyebrowStyle12 = [
  'eyebrow intro-eyebrow flex items-center gap-2.5 text-help font-medium tracking-[.13em]',
  'text-muted-foreground m-0 mb-5',
].join(' ')

const introAsideStyle13 = [
  'intro-aside min-w-0 [&_p]:text-body [&_p]:text-muted-foreground [&_p]:leading-[1.85] [&_p]:m-0',
  '[&_p]:mb-3 max-[760px]:max-w-90',
].join(' ')

const inlineFlexStyle14 = [
  'inline-flex items-center gap-6 min-h-11 text-control font-medium hover:text-accent',
].join(' ')

const directoryBottomStyle15 = [
  'directory-bottom flex items-start justify-between gap-10 pt-6 max-[760px]:flex-col',
  'max-[760px]:gap-4 [&_.appearance-settings]:border-0 [&_.appearance-settings]:p-0',
  '[&_.appearance-settings]:bg-transparent',
].join(' ')

const PREVIEW_FIELDS = [
  'hour',
  'minute',
  'second',
] as const
const DIAL_ANGLES = Array.from({ length: 24 }, (_, index) => index * 15)

function PreviewDigits({ parts }: { parts: ClockParts | null }): JSX.Element {
  return (
    <div className={previewDigitsStyle1}>
      {PREVIEW_FIELDS.map((field) => {
        const value = parts?.[field] ?? '--'
        return (
          <span
            key={field}
            className={`inline-flex items-center ${field === 'second' ? 'text-[var(--seconds-color)]' : ''}`}
          >
            {field !== 'hour' && (
              <span className="preview-colon text-muted-foreground mx-1 text-[length:.65em]">:</span>
            )}
            <SlidingDigit value={value.charAt(0)} />
            <SlidingDigit value={value.charAt(1)} />
          </span>
        )
      })}
    </div>
  )
}

function ClockPreview(): JSX.Element {
  const { t } = useSiteTranslation()
  const now = useCurrentTime()
  const parts = now === null ? null : getClockParts(now, resolveTimezone('local'), '24', 'en')
  return (
    <div className={pagePreviewStyle2} aria-hidden="true">
      <div className={previewCaptionStyle3}>
        <span className="inline-flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-accent" />
          {t('collection.title')}
        </span>
        <span className="font-mono">01</span>
      </div>
      <div className="preview-dial-frame pointer-events-none absolute inset-0 overflow-hidden">
        <svg
          className="preview-dial absolute size-58 right-[-34px] top-[-30px] pointer-events-none"
          viewBox="0 0 240 240"
          fill="none"
        >
          <circle className="dial-track" cx="120" cy="120" r="86" />
          <circle
            className="dial-progress"
            cx="120"
            cy="120"
            r="86"
            pathLength="100"
            strokeDasharray={`${parts?.progress ?? 0} 100`}
            transform="rotate(-90 120 120)"
          />
          {DIAL_ANGLES.map(angle => (
            <path key={angle} className="dial-tick" d="M120 20V28" transform={`rotate(${angle} 120 120)`} />
          ))}
        </svg>
      </div>
      <div className="relative pt-14 pb-8">
        <PreviewDigits parts={parts} />
      </div>
      <div className="relative">
        <div className="preview-progress h-px bg-border">
          <span className="block h-full bg-accent" style={{ width: `${parts?.progress ?? 0}%` }} />
        </div>
        <div className={previewTicksStyle4}>
          <span>00:00</span>
          <span>24:00</span>
        </div>
      </div>
    </div>
  )
}

function PageEntry({ page, number }: { page: (typeof PAGES)[number], number: number }): JSX.Element {
  const { t } = useSiteTranslation()
  return (
    <Link href={page.href} className={pageEntryStyle5} aria-labelledby={`page-${page.id}-title`}>
      <ClockPreview />
      <div className="page-entry-content min-w-0 max-[760px]:pb-2">
        <div className={pageEntryMetaStyle6}>
          <span className="collection-number font-mono text-accent">{String(number).padStart(2, '0')}</span>
          <span className="collection-category tracking-[.1em]">{t(page.categoryKey)}</span>
        </div>
        <h3 id={`page-${page.id}-title`} className={fontSansStyle7}>{t(page.titleKey)}</h3>
        <p className="max-w-100 m-0 text-body leading-[1.85] text-muted-foreground">{t(page.descriptionKey)}</p>
        <ul className={pageFeaturesStyle8}>
          {page.features.map(feature => <li key={feature}>{t(feature)}</li>)}
        </ul>
        <span className={pageOpenStyle9}>
          {t('pages.open')}
          <ArrowRight size={16} className={textAccentStyle10} aria-hidden="true" />
        </span>
      </div>
    </Link>
  )
}

export function PageDirectory(): JSX.Element {
  const { t } = useSiteTranslation()
  return (
    <SiteShell directory>
      <section className={introStyle11} aria-labelledby="intro-heading">
        <div>
          <p className={eyebrowStyle12}>
            <Asterisk size={17} className="text-accent" aria-hidden="true" />
            {t('intro.eyebrow')}
          </p>
          <h1 id="intro-heading">
            {t('intro.first')}
            <br />
            <span>{t('intro.second')}</span>
          </h1>
        </div>
        <div className={introAsideStyle13}>
          <p>{t('intro.description')}</p>
          <a href="#pages" className={inlineFlexStyle14}>
            {t('pages.browse')}
            <ArrowDown size={15} aria-hidden="true" />
          </a>
        </div>
      </section>
      <section id="pages" className="page-directory pb-14 max-[520px]:pb-9" aria-labelledby="pages-heading">
        <div className="collection-heading flex items-center justify-between gap-4 mb-4 text-help">
          <h2 id="pages-heading" className="m-0 text-control font-semibold">{t('pages.heading')}</h2>
          <span className="directory-count text-muted-foreground">{t('pages.count', { count: PAGES.length })}</span>
        </div>
        <ol className="page-list list-none m-0 p-0 grid gap-5">
          {PAGES.map((page, index) => (
            <li key={page.id}><PageEntry page={page} number={index + 1} /></li>
          ))}
        </ol>
        <div className={directoryBottomStyle15}>
          <p className="text-body text-muted-foreground leading-[1.8] max-w-80 m-0">{t('pages.note')}</p>
          <PalettePicker />
        </div>
      </section>
    </SiteShell>
  )
}
