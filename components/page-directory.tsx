'use client'

import type { JSX } from 'react'

import { ArrowDown, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { PalettePicker } from '@/components/palette-picker'
import { SiteShell } from '@/components/site-shell'
import { PAGES } from '@/lib/pages'

function PageEntry({ page, number }: { page: (typeof PAGES)[number], number: number }): JSX.Element {
  const { t } = useTranslation()
  return (
    <Link href={page.href} className="page-entry" aria-labelledby={`page-${page.id}-title`}>
      <ClockPreview />
      <div className="page-entry-content">
        <div className="page-entry-meta">
          <span className="collection-number">{String(number).padStart(2, '0')}</span>
          <span className="collection-category">{t(page.categoryKey)}</span>
        </div>
        <h3 id={`page-${page.id}-title`}>{t(page.titleKey)}</h3>
        <p>{t(page.descriptionKey)}</p>
        <ul className="page-features">{page.features.map(feature => <li key={feature}>{t(feature)}</li>)}</ul>
        <span className="page-open">
          {t('pages.open')}
          {' '}
          <ArrowRight size={15} />
        </span>
      </div>
      <span className="page-entry-arrow" aria-hidden="true"><ArrowRight size={20} /></span>
    </Link>
  )
}

function ClockPreview(): JSX.Element {
  const { t } = useTranslation()
  return (
    <div className="page-preview" aria-hidden="true">
      <div className="preview-caption">
        <span className="live-dot" />
        <span>{t('collection.title')}</span>
      </div>
      <div className="preview-digits">
        <span>10</span>
        <i>:</i>
        <span>24</span>
        <i>:</i>
        <span className="preview-seconds">36</span>
      </div>
      <div className="preview-progress"><span /></div>
      <div className="preview-ticks">
        <span>00:00</span>
        <span>24:00</span>
      </div>
    </div>
  )
}

export function PageDirectory(): JSX.Element {
  const { t } = useTranslation()
  return (
    <SiteShell directory>
      <section className="intro" aria-labelledby="intro-heading">
        <div>
          <p className="eyebrow intro-eyebrow">
            <span className="tiny-cross">✳</span>
            {' '}
            {t('intro.eyebrow')}
          </p>
          <h1 id="intro-heading">
            {t('intro.first')}
            <br />
            <span>{t('intro.second')}</span>
          </h1>
        </div>
        <div className="intro-aside">
          <p>{t('intro.description')}</p>
          <a href="#pages">
            {t('pages.browse')}
            {' '}
            <ArrowDown size={15} />
          </a>
        </div>
      </section>
      <section id="pages" className="page-directory" aria-labelledby="pages-heading">
        <div className="collection-heading">
          <h2 id="pages-heading">{t('pages.heading')}</h2>
          <span className="directory-count">{t('pages.count', { count: PAGES.length })}</span>
        </div>
        <ol className="page-list">
          {PAGES.map((page, index) => (
            <li key={page.id}>
              <PageEntry page={page} number={index + 1} />
            </li>
          ))}
        </ol>
        <div className="directory-bottom">
          <p>{t('pages.note')}</p>
          <PalettePicker />
        </div>
      </section>
    </SiteShell>
  )
}
