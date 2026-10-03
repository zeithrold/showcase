import type { Locale } from '@ztd-me/frontend'
import { en } from './locales/en.ts'
import { zhCN } from './locales/zh-CN.ts'

export type { Locale }
export { LOCALES } from '@ztd-me/frontend'
export const resources = { 'en': { translation: en }, 'zh-CN': { translation: zhCN } }
