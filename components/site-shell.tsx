'use client'

import type { JSX, ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SiteHeader } from '@/components/site-header'

export { IconButton } from '@/components/icon-button'

export function SiteShell({ children, directory = false }: { children: ReactNode, directory?: boolean }): JSX.Element {
  const { t } = useTranslation()
  return (
    <>
      <a className="skip-link" href="#main-content">{t('a11y.skip')}</a>
      <div className="site-shell">
        <SiteHeader directory={directory} />
        <main id="main-content" tabIndex={-1}>{children}</main>
        <footer className="site-footer">
          <span>
            {t('footer.credit')}
            {' '}
            <a href="https://ztd.me" target="_blank" rel="noreferrer">
              Zeithrold
              <ArrowUpRight size={12} />
            </a>
          </span>
          <span className="footer-right">
            <span className="footer-dot" />
            {' '}
            {t('footer.progress')}
          </span>
        </footer>
      </div>
    </>
  )
}
