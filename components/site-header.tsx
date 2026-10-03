'use client'

import type { JSX } from 'react'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { PAGES } from '@/lib/pages'

function AboutDialog(): JSX.Element {
  const { t } = useTranslation()
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="about-trigger" aria-label={t('header.about')}>
          <span className="project-action-label">{t('header.about')}</span>
          {' '}
          <ArrowUpRight size={13} />
        </Button>
      </DialogTrigger>
      <DialogContent className="about-dialog">
        <DialogHeader>
          <span className="eyebrow">{t('intro.eyebrow')}</span>
          <DialogTitle>{t('about.title')}</DialogTitle>
          <DialogDescription>{t('about.description')}</DialogDescription>
        </DialogHeader>
        <p className="about-credit">
          {t('about.credit')}
          {' '}
          <strong>Zeithrold</strong>
        </p>
        <a className="about-link" href="https://ztd.me" target="_blank" rel="noreferrer">
          {t('about.visit')}
          {' '}
          <ArrowUpRight size={15} />
        </a>
      </DialogContent>
    </Dialog>
  )
}

export function ProjectActions({ directory }: { directory: boolean }): JSX.Element {
  const { t } = useTranslation()
  return (
    <nav className="project-actions" aria-label={t('a11y.navigation')}>
      <Link className="nav-link" href="/#pages" aria-current={directory ? 'page' : undefined}>
        {t('header.collection')}
        {' '}
        <span className="nav-count">{String(PAGES.length).padStart(2, '0')}</span>
      </Link>
      <AboutDialog />
    </nav>
  )
}
