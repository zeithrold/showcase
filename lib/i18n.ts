import type { i18n, TOptions } from 'i18next'
import type { Locale } from '../components/ui/ztd-me/types.ts'
import { createInstance } from 'i18next'
import { en } from './locales/en.ts'
import { zhCN } from './locales/zh-CN.ts'

export type { Locale }
export { LOCALES } from '../components/ui/ztd-me/types.ts'
type ResourceKey = keyof typeof en
type PluralKey = {
  [K in ResourceKey]: K extends `${infer Base}_${'one' | 'other'}` ? Base : never
}[ResourceKey]
export type CopyKey = ResourceKey | PluralKey
export type ShowcaseTranslation = (key: CopyKey, options?: TOptions) => string
export const resources = { 'en': { translation: en }, 'zh-CN': { translation: zhCN } }

function reportLanguageError(error: unknown): void {
  console.error('Could not apply Showcase translations', error)
}

export function createShowcaseI18n(locale: Locale): i18n {
  const instance = createInstance()
  instance.init({
    lng: locale,
    fallbackLng: 'en',
    supportedLngs: ['en', 'zh-CN'],
    resources,
    keySeparator: false,
    initAsync: false,
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  }).catch(reportLanguageError)
  return instance
}

export function showcaseTranslation(instance: i18n, locale: Locale): ShowcaseTranslation {
  const translate = instance.getFixedT(locale)
  return (key, options) => {
    const values = { ...options, lng: locale, ns: 'translation' }
    // i18next prioritizes lngs over lng; callers cannot replace the root locale.
    delete values.lngs
    return translate(key, values)
  }
}

export function applyShowcaseLocale(instance: i18n, locale: Locale): void {
  if (instance.language !== locale) {
    instance.changeLanguage(locale).catch(reportLanguageError)
  }
  const description = showcaseTranslation(instance, locale)('meta.description')
  document.querySelector('meta[name="description"]')?.setAttribute('content', description)
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', description)
}
