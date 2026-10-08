import type { Metadata } from 'next'
import type { JSX, ReactNode } from 'react'
import { FrontendAdapter } from '@/components/frontend-adapter'
import { frontendRequestState } from '@/lib/frontend-request'
import { resources } from '@/lib/i18n'
import { frontendRootAttributes } from '../components/ui/ztd-me/index.ts'
import './globals.css'

const SCROLL_SMOOTH_CLASS = [
  'scroll-smooth scroll-pt-8 motion-reduce:scroll-auto [color-scheme:var(--ztd-color-scheme)]',
].join(' ')

const M_0_CLASS = ['m-0 min-w-80 bg-background font-sans text-body text-foreground [font-synthesis:none]'].join(' ')

export async function generateMetadata(): Promise<Metadata> {
  const { initialPreferences } = await frontendRequestState()
  const description = resources[initialPreferences.locale].translation['meta.description']
  return {
    title: 'zeithrold/showcase',
    description,
    metadataBase: new URL('https://showcase.ztd.me'),
    icons: { icon: '/favicon.svg' },
    openGraph: {
      title: 'zeithrold/showcase',
      description,
      url: 'https://showcase.ztd.me',
      type: 'website',
    },
  }
}

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>): Promise<JSX.Element> {
  const initial = await frontendRequestState()
  return (
    <html className={SCROLL_SMOOTH_CLASS} {...frontendRootAttributes(initial.initialPreferences)}>
      <body className={M_0_CLASS}><FrontendAdapter {...initial}>{children}</FrontendAdapter></body>
    </html>
  )
}
