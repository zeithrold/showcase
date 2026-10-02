'use client'

import type { JSX } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

export function ClockIntro(): JSX.Element {
  const { t } = useTranslation()
  return (
    <section className="tool-intro" aria-labelledby="clock-heading">
      <Link href="/" className="back-link">
        <ArrowLeft size={14} />
        {t('pages.back')}
      </Link>
      <div className="tool-intro-body">
        <div>
          <p className="eyebrow intro-eyebrow">
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
  const { t } = useTranslation()
  return (
    <section className="field-notes" aria-label={t('notes.label')}>
      <div className="notes-heading">
        <span className="eyebrow">{t('notes.heading')}</span>
        <span className="notes-line" />
      </div>
      <div className="notes-grid">
        <div className="note">
          <span className="note-index">{t('notes.interactionIndex')}</span>
          <h3>{t('notes.interactionTitle')}</h3>
          <p>{t('notes.interactionBody')}</p>
        </div>
        <div className="note">
          <span className="note-index">{t('notes.everydayIndex')}</span>
          <h3>{t('notes.everydayTitle')}</h3>
          <p>{t('notes.everydayBody')}</p>
        </div>
      </div>
    </section>
  )
}
