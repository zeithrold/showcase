'use client'

import type { JSX } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useSiteTranslation } from '@/components/i18n/use-site-translation'
import { SiteShell } from '@/components/site-shell'

const TITLE_CLASS = [
  'm-0 text-[length:32px] font-semibold tracking-[-.035em] leading-[1.25] text-balance',
  'max-[760px]:text-[length:26px] [html:lang(zh-CN)_&]:leading-[1.4] wrap-anywhere',
].join(' ')

const RETURN_CLASS = [
  'mt-6 inline-flex min-h-11 items-center gap-2 text-control font-medium text-foreground no-underline',
  'transition-colors hover:text-accent-foreground motion-reduce:transition-none',
].join(' ')

export default function NotFound(): JSX.Element {
  const { t } = useSiteTranslation()
  return (
    <SiteShell>
      <section className="max-w-160 py-20 max-[760px]:py-12" aria-labelledby="recovery-heading">
        <p className="m-0 mb-4 text-help font-medium tracking-[.14em] text-muted-foreground">404</p>
        <h1 className={TITLE_CLASS} id="recovery-heading">{t('notfound.title')}</h1>
        <p className="m-0 mt-4 max-w-[48ch] text-body leading-[1.8] text-muted-foreground">
          {t('notfound.description')}
        </p>
        <a className={RETURN_CLASS} href="/">
          <ArrowLeft size={16} aria-hidden="true" />
          {t('pages.back')}
        </a>
      </section>
    </SiteShell>
  )
}
