import type { PreferencePolicy } from '../components/ui/ztd-me/index.ts'
import { createPreferencePolicy } from '../components/ui/ztd-me/index.ts'

const COOKIE_NAMES = {
  production: 'ztd.frontend.v1',
  preview: 'ztd.frontend.preview.showcase.v1',
  development: 'ztd.frontend.development.showcase.v1',
} as const

export function showcasePreferencePolicy(environment: keyof typeof COOKIE_NAMES): PreferencePolicy {
  const name = COOKIE_NAMES[environment]
  return createPreferencePolicy({
    name,
    secure: environment !== 'development',
    mirrorKey: name,
    ...(environment === 'production' ? { domain: 'ztd.me' } : {}),
  })
}
