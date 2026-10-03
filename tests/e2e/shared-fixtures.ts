import type { BrowserContext, Page } from '@playwright/test'
import type { FrontendPreferences } from '@ztd-me/frontend'

export const COOKIE_NAME = 'ztd.frontend.development.showcase.v1'
export const SHARED_PREFERENCES: FrontendPreferences = { version: 1, mode: 'dark', palette: 'ocean', locale: 'zh-CN' }

export async function setSharedCookie(context: BrowserContext, preferences = SHARED_PREFERENCES): Promise<void> {
  await context.addCookies([
    {
      name: COOKIE_NAME,
      value: encodeURIComponent(JSON.stringify(preferences)),
      domain: 'localhost',
      path: '/',
      sameSite: 'Lax',
    },
  ])
}

export async function changeLocale(page: Page, locale: 'en' | 'zh-CN'): Promise<void> {
  const current = await page.locator('html').getAttribute('lang')
  await page.getByRole('combobox', { name: current === 'zh-CN' ? '语言' : 'Language', exact: true }).click()
  await page.getByRole('option', { name: locale === 'zh-CN' ? '简体中文' : 'English', exact: true }).click()
}

export async function denyStorage(page: Page, cookies = true): Promise<void> {
  await page.addInitScript((denyCookies) => {
    const storage = window.localStorage
    storage.setItem('synthetic.business.record', JSON.stringify({ token: 'synthetic-private' }))
    const cookie = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')
    Reflect.set(window, 'denyShowcaseStorage', true)
    const denied = () => Reflect.get(window, 'denyShowcaseStorage') === true
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        if (denied()) {
          throw new DOMException('Storage denied', 'SecurityError')
        }
        return storage
      },
    })
    if (denyCookies) {
      Object.defineProperty(document, 'cookie', {
        configurable: true,
        get() {
          if (denied()) {
            throw new DOMException('Cookie reads denied', 'SecurityError')
          }
          const value: unknown = cookie?.get?.call(document)
          return typeof value === 'string' ? value : ''
        },
        set(value: unknown) {
          if (denied()) {
            throw new DOMException('Cookie writes denied', 'SecurityError')
          }
          if (typeof value === 'string') {
            cookie?.set?.call(document, value)
          }
        },
      })
    }
  }, cookies)
}
