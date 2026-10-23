'use client'

import type { JSX, ReactNode } from 'react'
import type { LinkProps } from './ui/ztd-me/index.ts'
import { Info } from 'lucide-react'
import Link from 'next/link'
import { useSiteTranslation } from '@/components/i18n/use-site-translation'
import { ShowcaseMark } from '@/components/showcase-mark'
import { ProjectActions } from '@/components/site-header'
import { PublicShell, useFrontendPreferences } from './ui/ztd-me/client.ts'

const DESKTOP_PROJECT_ACTIONS_CLASS = ['desktop-project-actions contents max-[639.99px]:hidden'].join(' ')

const SITE_CONTENT_CLASS = [
  'site-content w-[min(1120px,_calc(100%_-_96px))] my-0 mx-auto max-[1050px]:w-[calc(100%_-_64px)]',
  'max-[760px]:w-[calc(100%_-_40px)]',
].join(' ')

const MOBILE_PROJECT_ACTIONS_CLASS = [
  'mobile-project-actions hidden max-[639.99px]:block max-[639.99px]:py-3',
  'max-[639.99px]:[&_.project-actions]:justify-end',
].join(' ')

const BRAND_CLASS = ['max-[639.99px]:[&>.brand-mark]:hidden max-[639.99px]:[&>span]:whitespace-nowrap'].join(' ')

const PERSISTENCE_NOTICE_CLASS = [
  'persistence-notice flex items-start gap-2.5 border-l-2 border-border mt-4 pl-3 py-1',
  'text-help text-muted-foreground leading-[1.7]',
].join(' ')

export { IconButton } from '@/components/icon-button'

function ProjectLink(props: LinkProps): JSX.Element {
  const { t } = useSiteTranslation()
  return <Link {...props} aria-label={props.href === '/' ? t('a11y.home') : props['aria-label']} />
}

export function SiteShell({ children, directory = false }: { children: ReactNode, directory?: boolean }): JSX.Element {
  const { t } = useSiteTranslation()
  const { persistence } = useFrontendPreferences()
  return (
    <PublicShell
      brand={{ label: 'zeithrold/showcase', homeHref: '/', mark: <ShowcaseMark /> }}
      brandClassName={BRAND_CLASS}
      footer={{
        copyright: '© Zeithrold',
        links: [
          { label: 'GitHub', href: 'https://github.com/zeithrold/showcase', ariaLabel: t('footer.source') },
          { label: 'hello@ztd.me', href: 'mailto:hello@ztd.me' },
        ],
      }}
      mainId="main-content"
      linkComponent={ProjectLink}
      projectActions={<div className={DESKTOP_PROJECT_ACTIONS_CLASS}><ProjectActions directory={directory} /></div>}
    >
      <div className={SITE_CONTENT_CLASS}>
        <div className={MOBILE_PROJECT_ACTIONS_CLASS}>
          <ProjectActions directory={directory} />
        </div>
        {persistence === 'unavailable' && (
          <div className={PERSISTENCE_NOTICE_CLASS} role="status">
            <Info size={15} className="shrink-0 mt-0.5" aria-hidden="true" />
            <p className="m-0">{t('settings.persistenceUnavailable')}</p>
          </div>
        )}
        {children}
      </div>
    </PublicShell>
  )
}
