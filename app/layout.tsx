import type { Metadata } from 'next'
import type { JSX } from 'react'
import { ShowcaseI18nProvider } from '@/components/i18n-provider'
import { PreferencesProvider } from '@/components/preferences-provider'
import { en } from '@/lib/locales/en'
import './globals.css'

export const metadata: Metadata = {
  title: 'zeithrold/showcase',
  description: en['meta.description'],
  metadataBase: new URL('https://showcase.ztd.me'),
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'zeithrold/showcase',
    description: en['meta.description'],
    url: 'https://showcase.ztd.me',
    type: 'website',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>): JSX.Element {
  return (
    <html lang="en">
      <body><ShowcaseI18nProvider><PreferencesProvider>{children}</PreferencesProvider></ShowcaseI18nProvider></body>
    </html>
  )
}
