'use client'

import type { LinkProps } from '@ztd-me/frontend'
import type { JSX, ReactNode } from 'react'
import { PublicShell, useFrontendPreferences } from '@ztd-me/frontend/client'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { ShowcaseMark } from '@/components/showcase-mark'
import { ProjectActions } from '@/components/site-header'

export { IconButton } from '@/components/icon-button'

function ProjectLink(props: LinkProps): JSX.Element {
  const { t } = useTranslation()
  return <Link {...props} aria-label={props.href === '/' ? t('a11y.home') : props['aria-label']} />
}

export function SiteShell({ children, directory = false }: { children: ReactNode, directory?: boolean }): JSX.Element {
  const { t } = useTranslation()
  const { persistence } = useFrontendPreferences()
  return (
    <PublicShell
      brand={{ label: 'zeithrold/showcase', homeHref: '/', mark: <ShowcaseMark /> }}
      footer={{
        copyright: '© Zeithrold',
        links: [
          { label: 'GitHub', href: 'https://github.com/zeithrold/showcase', ariaLabel: t('footer.source') },
          { label: 'hello@ztd.me', href: 'mailto:hello@ztd.me' },
        ],
      }}
      mainId="main-content"
      linkComponent={ProjectLink}
      projectActions={<div className="desktop-project-actions"><ProjectActions directory={directory} /></div>}
    >
      <div className="site-content">
        <div className="mobile-project-actions"><ProjectActions directory={directory} /></div>
        {persistence === 'unavailable' && <p role="status">{t('settings.persistenceUnavailable')}</p>}
        {children}
      </div>
    </PublicShell>
  )
}
