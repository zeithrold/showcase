import type { FrontendPreferences, PreferencePolicy } from '@ztd-me/frontend'
import process from 'node:process'
import { createPreferencePolicy, resolveInitialPreferences } from '@ztd-me/frontend'
import { headers } from 'next/headers'
import { showcaseAcceptLanguage } from './frontend-locale'

function deploymentEnvironment(): 'production' | 'preview' | 'development' {
  const configured = process.env.SHOWCASE_FRONTEND_ENVIRONMENT
  if (process.env.NODE_ENV === 'development' || configured === 'development') {
    return 'development'
  }
  return configured === 'production' ? 'production' : 'preview'
}

function preferencePolicy(): PreferencePolicy {
  const environment = deploymentEnvironment()
  return createPreferencePolicy({
    environment,
    namespace: 'showcase',
    hostname: environment === 'production' ? 'showcase.ztd.me' : 'localhost',
    protocol: environment === 'development' ? 'http:' : 'https:',
  })
}

export async function frontendRequestState(): Promise<{
  policy: PreferencePolicy
  initialPreferences: FrontendPreferences
}> {
  const request = await headers()
  const policy = preferencePolicy()
  const initialPreferences = resolveInitialPreferences({
    policy,
    cookieHeader: request.get('cookie') ?? undefined,
    acceptLanguage: showcaseAcceptLanguage(request.get('accept-language') ?? ''),
  })
  return { policy, initialPreferences }
}
