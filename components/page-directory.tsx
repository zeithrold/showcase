'use client'

import type { JSX } from 'react'

import { ArrowDown, ArrowRight, Asterisk } from 'lucide-react'
import Link from 'next/link'
import { useSiteTranslation } from '@/components/i18n/use-site-translation'
import { PalettePicker } from '@/components/palette-picker'
import { SiteShell } from '@/components/site-shell'
import { PAGES } from '@/lib/pages'

const COLLECTION_NUMBER_CLASS = ['collection-number text-help tabular-nums text-accent'].join(' ')

const DIRECTORY_COUNT_CLASS = ['directory-count text-help text-muted-foreground'].join(' ')

const TINY_CROSS_CLASS = ['tiny-cross text-accent text-[length:19px] leading-[12px]'].join(' ')

const PAGE_ENTRY_CLASS = [
  'page-entry grid grid-cols-[340px_minmax(0,_1fr)_42px] gap-[38px] items-center p-[22px] border',
  'border-border rounded-[20px] bg-card [transition:border-color_.2s,_box-shadow_.2s]',
  'hover:border-[color-mix(in_srgb,_var(--ztd-accent)_45%,_var(--ztd-border))]',
  'hover:shadow-[0_8px_32px_color-mix(in_srgb,_var(--ztd-foreground)_4%,_transparent)]',
  '[&:hover_.page-open_svg]:transform-[translateX(3px)] max-[1050px]:grid-cols-[290px_minmax(0,_1fr)]',
  'max-[1050px]:gap-7 max-[760px]:grid-cols-[minmax(0,_1fr)] max-[760px]:gap-6 max-[760px]:p-5',
  'max-[520px]:p-3 max-[520px]:rounded-[14px] max-[520px]:gap-6',
].join(' ')

const PAGE_ENTRY_CONTENT_CLASS = [
  'page-entry-content [&_h3]:mt-[14px] [&_h3]:mx-0 [&_h3]:mb-[10px] [&_h3]:font-sans',
  '[&_h3]:text-[length:30px] [&_h3]:font-medium [&_h3]:tracking-[-1px] [&_>_p]:m-0',
  '[&_>_p]:text-muted-foreground [&_>_p]:text-body [&_>_p]:leading-[1.9] max-[760px]:pt-0',
  'max-[760px]:px-1 max-[760px]:pb-[5px] max-[760px]:[&_>_p]:max-w-full max-[520px]:pt-0 max-[520px]:px-2',
  'max-[520px]:pb-3 max-[520px]:[&_h3]:text-[length:26px] max-[520px]:[&_>_p]:text-body min-w-0',
  'wrap-anywhere [&_>_p]:max-w-[65ch]',
].join(' ')

const PAGE_ENTRY_META_CLASS = [
  'page-entry-meta flex items-center gap-3 max-[520px]:[&_.collection-category]:text-help',
  'max-[520px]:[&_.collection-category]:tracking-[1px]',
].join(' ')

const COLLECTION_CATEGORY_CLASS = [
  'collection-category text-muted-foreground text-help tracking-[1.4px] max-[520px]:text-help',
  'max-[520px]:tracking-[.7px]',
].join(' ')

const PAGE_FEATURES_CLASS = [
  'page-features list-none flex flex-wrap gap-[7px] p-0 mt-[18px] mx-0 mb-[22px] [&_li]:border',
  '[&_li]:border-border [&_li]:rounded-[5px] [&_li]:py-1 [&_li]:px-[7px] [&_li]:text-muted-foreground',
  '[&_li]:text-help max-[760px]:mb-5',
].join(' ')

const PAGE_OPEN_CLASS = [
  'page-open [&_svg]:text-accent [&_svg]:[transition:transform_.2s] inline-flex items-center gap-[10px]',
  'text-control font-medium',
].join(' ')

const PAGE_ENTRY_ARROW_CLASS = [
  'page-entry-arrow w-[42px] h-[42px] flex justify-center items-center border border-border rounded-full',
  'text-accent max-[1050px]:hidden',
].join(' ')

const PAGE_PREVIEW_CLASS = [
  'page-preview py-9 px-7 bg-background border border-border rounded-[12px] max-[1050px]:py-8',
  'max-[1050px]:px-5 max-[760px]:flex max-[760px]:flex-col max-[760px]:justify-center',
  'max-[760px]:p-[30px] max-[760px]:min-h-50 max-[520px]:py-6 max-[520px]:px-[18px] max-[520px]:min-h-45',
  'max-[520px]:rounded-[8px]',
].join(' ')

const PREVIEW_CAPTION_CLASS = [
  'preview-caption flex items-center gap-[7px] text-muted-foreground text-help tracking-[1px]',
].join(' ')

const LIVE_DOT_CLASS = [
  'live-dot w-[5px] h-[5px] rounded-full bg-accent',
  'shadow-[0_0_0_3px_color-mix(in_srgb,_var(--ztd-accent)_5%,_transparent)]',
].join(' ')

const PREVIEW_DIGITS_CLASS = [
  'preview-digits flex justify-center items-center gap-[2px] py-6 px-0 text-[var(--clock-color)]',
  'font-sans tabular-nums text-[length:53px] font-normal leading-[1.15] tracking-[-1px] [&_i]:not-italic',
  '[&_i]:text-[length:34px] [&_i]:text-muted-foreground [&_i]:opacity-[.5] [&_i]:my-0 [&_i]:mx-[3px]',
  'max-[1050px]:text-[length:46px] max-[760px]:text-[length:58px]',
  'max-[520px]:text-[length:clamp(38px,_12vw,_50px)] max-[520px]:py-[22px] max-[520px]:px-0',
  'max-[520px]:[&_i]:text-[length:27px] max-[520px]:[&_i]:my-0 max-[520px]:[&_i]:mx-[2px]',
].join(' ')

const PREVIEW_PROGRESS_CLASS = [
  'preview-progress h-[2px] bg-muted rounded-[2px] [&_>_span]:block [&_>_span]:w-[43%] [&_>_span]:h-full',
  '[&_>_span]:bg-accent [&_>_span]:rounded-[inherit]',
].join(' ')

const PREVIEW_TICKS_CLASS = ['preview-ticks flex justify-between text-muted-foreground text-help mt-2'].join(' ')

const INTRO_CLASS = [
  'intro flex justify-between items-end pt-[65px] px-0 pb-[62px] max-[760px]:pt-[45px] max-[760px]:px-0',
  'max-[760px]:pb-11 max-[520px]:block max-[520px]:pt-[38px] max-[520px]:px-0 max-[520px]:pb-[35px]',
].join(' ')

const EYEBROW_CLASS = [
  'eyebrow intro-eyebrow text-help font-medium tracking-[1.7px] text-muted-foreground flex items-center',
  'gap-2 mt-0 mx-0 mb-5 max-[520px]:mb-4 max-[520px]:text-help max-[520px]:tracking-[1.4px]',
].join(' ')

const INTRO_ASIDE_CLASS = [
  'intro-aside mb-[6px] w-[245px] [&_p]:text-muted-foreground [&_p]:text-body [&_p]:leading-[1.85]',
  '[&_p]:mt-0 [&_p]:mx-0 [&_p]:mb-[22px] [&_p]:whitespace-pre-line [&_a]:inline-flex [&_a]:items-center',
  '[&_a]:gap-[22px] [&_a]:text-help [&_a]:font-medium [&_a_svg]:text-accent',
  '[&_a_svg]:[transition:transform_.2s] [&_a:hover_svg]:transform-[translateY(3px)] max-[760px]:mb-1',
  'max-[760px]:[&_p]:text-body max-[520px]:flex max-[520px]:items-center max-[520px]:justify-between',
  'max-[520px]:w-full max-[520px]:mt-[22px] max-[520px]:[&_p]:m-0 max-[520px]:[&_p]:text-body',
  'max-[520px]:[&_p]:leading-[1.7] max-[520px]:[&_a]:text-help max-[520px]:[&_a]:gap-2 min-w-0',
  'wrap-anywhere [&_p]:max-w-[65ch] max-[760px]:w-full',
].join(' ')

const COLLECTION_HEADING_CLASS = [
  'collection-heading flex justify-between items-center mb-[17px] [&_h2]:flex [&_h2]:items-center',
  '[&_h2]:gap-3 [&_h2]:m-0 [&_h2]:text-control [&_h2]:font-medium max-[520px]:[&_h2]:text-help',
  'max-[520px]:[&_h2]:gap-[9px]',
].join(' ')

const DIRECTORY_BOTTOM_CLASS = [
  'directory-bottom flex justify-between items-center gap-[30px] pt-[26px] [&_>_p]:max-w-85',
  '[&_>_p]:text-muted-foreground [&_>_p]:text-body [&_>_p]:leading-[1.8]',
  '[&_.appearance-settings]:bg-transparent [&_.appearance-settings]:border-t-0',
  '[&_.appearance-settings]:p-0 [&_.palette-name]:min-w-[58px] max-[1050px]:items-start',
  'max-[760px]:flex-col max-[760px]:gap-2 max-[760px]:pt-[14px] max-[760px]:[&_>_p]:max-w-full',
  'max-[760px]:[&_.appearance-settings]:w-full max-[520px]:[&_.palette-name]:min-w-0',
].join(' ')

function PageEntry({ page, number }: { page: (typeof PAGES)[number], number: number }): JSX.Element {
  const { t } = useSiteTranslation()
  return (
    <Link
      href={page.href}
      className={PAGE_ENTRY_CLASS}
      aria-labelledby={`page-${page.id}-title`}
    >
      <ClockPreview />
      <div className={PAGE_ENTRY_CONTENT_CLASS}>
        <div className={PAGE_ENTRY_META_CLASS}>
          <span className={COLLECTION_NUMBER_CLASS}>{String(number).padStart(2, '0')}</span>
          <span className={COLLECTION_CATEGORY_CLASS}>
            {t(page.categoryKey)}
          </span>
        </div>
        <h3 id={`page-${page.id}-title`}>{t(page.titleKey)}</h3>
        <p>{t(page.descriptionKey)}</p>
        <ul className={PAGE_FEATURES_CLASS}>
          {page.features.map(feature => <li key={feature}>{t(feature)}</li>)}
        </ul>
        <span className={PAGE_OPEN_CLASS}>
          {t('pages.open')}
          {' '}
          <ArrowRight size={15} />
        </span>
      </div>
      <span
        className={PAGE_ENTRY_ARROW_CLASS}
        aria-hidden="true"
      >
        <ArrowRight size={20} />
      </span>
    </Link>
  )
}

function ClockPreview(): JSX.Element {
  const { t } = useSiteTranslation()
  return (
    <div
      className={PAGE_PREVIEW_CLASS}
      aria-hidden="true"
    >
      <div className={PREVIEW_CAPTION_CLASS}>
        <span className={LIVE_DOT_CLASS} />
        <span>{t('collection.title')}</span>
      </div>
      <div className={PREVIEW_DIGITS_CLASS}>
        <span>10</span>
        <i>:</i>
        <span>24</span>
        <i>:</i>
        <span className="preview-seconds text-[var(--seconds-color)]">36</span>
      </div>
      <div className={PREVIEW_PROGRESS_CLASS}>
        <span />
      </div>
      <div className={PREVIEW_TICKS_CLASS}>
        <span>00:00</span>
        <span>24:00</span>
      </div>
    </div>
  )
}

export function PageDirectory(): JSX.Element {
  const { t } = useSiteTranslation()
  return (
    <SiteShell directory>
      <section
        className={INTRO_CLASS}
        aria-labelledby="intro-heading"
      >
        <div>
          <p className={EYEBROW_CLASS}>
            <Asterisk className={TINY_CROSS_CLASS} size={24} aria-hidden="true" />
            {' '}
            {t('intro.eyebrow')}
          </p>
          <h1 id="intro-heading">
            {t('intro.first')}
            <br />
            <span>{t('intro.second')}</span>
          </h1>
        </div>
        <div className={INTRO_ASIDE_CLASS}>
          <p>{t('intro.description')}</p>
          <a href="#pages">
            {t('pages.browse')}
            {' '}
            <ArrowDown size={15} />
          </a>
        </div>
      </section>
      <section id="pages" className="page-directory pb-15 max-[520px]:pb-9" aria-labelledby="pages-heading">
        <div className={COLLECTION_HEADING_CLASS}>
          <h2 id="pages-heading">{t('pages.heading')}</h2>
          <span className={DIRECTORY_COUNT_CLASS}>{t('pages.count', { count: PAGES.length })}</span>
        </div>
        <ol className="page-list list-none m-0 p-0 grid gap-5">
          {PAGES.map((page, index) => (
            <li key={page.id}>
              <PageEntry page={page} number={index + 1} />
            </li>
          ))}
        </ol>
        <div className={DIRECTORY_BOTTOM_CLASS}>
          <p>{t('pages.note')}</p>
          <PalettePicker />
        </div>
      </section>
    </SiteShell>
  )
}
