import type { Locale } from '../components/ui/ztd-me/index.ts'
import { en } from './locales/en.ts'
import { zhCN } from './locales/zh-CN.ts'

export type { Locale }
export { LOCALES } from '../components/ui/ztd-me/index.ts'
export const resources = { 'en': { translation: en }, 'zh-CN': { translation: zhCN } }
