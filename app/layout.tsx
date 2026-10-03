import type { Metadata } from 'next'
import type { JSX, ReactNode } from 'react'
import { frontendRootAttributes } from '@ztd-me/frontend'
import { FrontendAdapter } from '@/components/frontend-adapter'
import { frontendRequestState } from '@/lib/frontend-request'
import { resources } from '@/lib/i18n'
import '@ztd-me/frontend/styles.css'
import './globals.css'

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
    <html {...frontendRootAttributes(initial.initialPreferences)}>
      <body><FrontendAdapter {...initial}>{children}</FrontendAdapter></body>
    </html>
  )
}
