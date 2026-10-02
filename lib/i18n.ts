import { en } from './locales/en.ts'
import { zhCN } from './locales/zh-CN.ts'

export const LOCALES = ['en', 'zh-CN'] as const
export type Locale = (typeof LOCALES)[number]
export const resources = { 'en': { translation: en }, 'zh-CN': { translation: zhCN } }

export function detectLocale(languages: readonly string[]): Locale {
  for (const language of languages) {
    if (/^zh(?:-|$)/i.test(language)) {
      return 'zh-CN'
    }
    if (/^en(?:-|$)/i.test(language)) {
      return 'en'
    }
  }
  return 'en'
}

export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'zh-CN'
}
