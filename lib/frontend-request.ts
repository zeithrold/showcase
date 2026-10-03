import type { FrontendPreferences, PreferencePolicy } from '../components/ui/ztd-me/index.ts'
import process from 'node:process'
import { headers } from 'next/headers'
import { resolveInitialPreferences } from '../components/ui/ztd-me/index.ts'
import { showcaseAcceptLanguage } from './frontend-locale'
import { showcasePreferencePolicy } from './frontend-policy'

function deploymentEnvironment(): 'production' | 'preview' | 'development' {
  const configured = process.env.SHOWCASE_FRONTEND_ENVIRONMENT
  if (process.env.NODE_ENV === 'development' || configured === 'development') {
    return 'development'
  }
  return configured === 'production' ? 'production' : 'preview'
}

export async function frontendRequestState(): Promise<{
  policy: PreferencePolicy
  initialPreferences: FrontendPreferences
}> {
  const request = await headers()
  const policy = showcasePreferencePolicy(deploymentEnvironment())
  const initialPreferences = resolveInitialPreferences({
    policy,
    cookieHeader: request.get('cookie') ?? undefined,
    acceptLanguage: showcaseAcceptLanguage(request.get('accept-language') ?? ''),
  })
  return { policy, initialPreferences }
}
