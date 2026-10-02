'use client'

import type { JSX } from 'react'
import { ArrowUpRight, Languages, Moon, Sun } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { IconButton } from '@/components/icon-button'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { isLocale } from '@/lib/i18n'
import { PAGES } from '@/lib/pages'
import { usePreferences } from '@/lib/preferences-context'

function Mark(): JSX.Element {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  )
}

function AboutDialog(): JSX.Element {
  const { t } = useTranslation()
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="about-trigger">
          {t('header.about')}
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

export function SiteHeader({ directory }: { directory: boolean }): JSX.Element {
  const { t } = useTranslation()
  const { preferences, update } = usePreferences()
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label={t('a11y.home')}>
        <Mark />
        <span>
          <span className="brand-owner">zeithrold</span>
          <span className="brand-slash">/</span>
          showcase
        </span>
      </Link>
      <nav className="header-nav" aria-label={t('a11y.navigation')}>
        <Link className="nav-link" href="/#pages" aria-current={directory ? 'page' : undefined}>
          {t('header.collection')}
          {' '}
          <span className="nav-count">{String(PAGES.length).padStart(2, '0')}</span>
        </Link>
        <AboutDialog />
        <span className="nav-divider" />
        <Select
          value={preferences.locale}
          onValueChange={(locale) => {
            if (isLocale(locale)) {
              update({ locale })
            }
          }}
        >
          <SelectTrigger className="language-select" aria-label={t('header.language')}>
            <Languages size={14} />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="zh-CN">简体中文</SelectItem>
          </SelectContent>
        </Select>
        <IconButton
          label={t(preferences.theme === 'light' ? 'header.dark' : 'header.light')}
          onClick={() => update({ theme: preferences.theme === 'light' ? 'dark' : 'light' })}
        >
          {preferences.theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
        </IconButton>
      </nav>
    </header>
  )
}
