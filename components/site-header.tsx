'use client'

import type { JSX } from 'react'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { useSiteTranslation } from '@/components/i18n/use-site-translation'
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

const EYEBROW_CLASS = ['eyebrow text-help font-medium tracking-[1.7px] text-muted-foreground'].join(' ')

const ABOUT_TRIGGER_CLASS = [
  'about-trigger text-control font-medium h-8 p-0 bg-transparent text-muted-foreground gap-[5px]',
  'hover:text-accent max-[520px]:text-control',
].join(' ')

const ABOUT_DIALOG_CLASS = [
  'about-dialog rounded-[18px] p-10 bg-card [&_[data-slot="dialog-title"]]:font-sans',
  '[&_[data-slot="dialog-title"]]:text-[length:30px] [&_[data-slot="dialog-title"]]:tracking-[-1px]',
  '[&_[data-slot="dialog-title"]]:mt-[14px] [&_[data-slot="dialog-title"]]:font-medium',
  '[&_[data-slot="dialog-description"]]:text-body [&_[data-slot="dialog-description"]]:leading-[1.9]',
  '[&_[data-slot="dialog-description"]]:mt-2 max-[520px]:py-[30px] max-[520px]:px-[25px]',
].join(' ')

const ABOUT_CREDIT_CLASS = [
  'about-credit text-muted-foreground text-help mt-[10px] [&_strong]:text-foreground',
  '[&_strong]:font-medium',
].join(' ')

const ABOUT_LINK_CLASS = [
  'about-link inline-flex items-center gap-2 text-accent text-control w-[fit-content]',
].join(' ')

const PROJECT_ACTIONS_CLASS = [
  'project-actions flex items-center gap-3 max-[639.99px]:gap-1 max-[639.99px]:[&_.nav-count]:hidden',
  '[&_.nav-link]:min-w-11 [&_.nav-link]:min-h-11 [&_.about-trigger]:min-w-11 [&_.about-trigger]:min-h-11',
].join(' ')

const NAV_LINK_CLASS = [
  'nav-link text-control font-medium flex items-center gap-2 hover:text-accent max-[520px]:text-control',
].join(' ')

const NAV_COUNT_CLASS = [
  'nav-count text-help text-muted-foreground py-[2px] px-[5px] border border-border rounded-[4px]',
  'max-[520px]:hidden',
].join(' ')

function AboutDialog(): JSX.Element {
  const { t } = useSiteTranslation()
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className={ABOUT_TRIGGER_CLASS}
          aria-label={t('header.about')}
        >
          <span className="project-action-label">{t('header.about')}</span>
          {' '}
          <ArrowUpRight size={13} />
        </Button>
      </DialogTrigger>
      <DialogContent className={ABOUT_DIALOG_CLASS}>
        <DialogHeader>
          <span className={EYEBROW_CLASS}>{t('intro.eyebrow')}</span>
          <DialogTitle>{t('about.title')}</DialogTitle>
          <DialogDescription>{t('about.description')}</DialogDescription>
        </DialogHeader>
        <p className={ABOUT_CREDIT_CLASS}>
          {t('about.credit')}
          {' '}
          <strong>Zeithrold</strong>
        </p>
        <a
          className={ABOUT_LINK_CLASS}
          href="https://ztd.me"
          target="_blank"
          rel="noreferrer"
        >
          {t('about.visit')}
          {' '}
          <ArrowUpRight size={15} />
        </a>
      </DialogContent>
    </Dialog>
  )
}

export function ProjectActions({ directory }: { directory: boolean }): JSX.Element {
  const { t } = useSiteTranslation()
  return (
    <nav
      className={PROJECT_ACTIONS_CLASS}
      aria-label={t('a11y.navigation')}
    >
      <Link
        className={NAV_LINK_CLASS}
        href="/#pages"
        aria-current={directory ? 'page' : undefined}
      >
        {t('header.collection')}
        {' '}
        <span className={NAV_COUNT_CLASS}>
          {String(PAGES.length).padStart(2, '0')}
        </span>
      </Link>
      <AboutDialog />
    </nav>
  )
}
