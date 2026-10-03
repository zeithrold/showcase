import type { BrowserContext, Page } from '@playwright/test'
import { expect } from '@playwright/test'

export const SHOWCASE_ORIGIN = 'https://showcase.ztd.me'
export const SIBLING_ORIGIN = 'https://memory.ztd.me'
export const PREVIEW_ORIGIN = 'https://preview.ztd.me'

// Synthetic HTTPS origins proxy only the locally built Worker. No production traffic occurs.
export async function interceptWorkerOrigins(context: BrowserContext): Promise<void> {
  await context.route('https://*.ztd.me/**', async (route) => {
    const original = new URL(route.request().url())
    const port = original.origin === PREVIEW_ORIGIN ? 4175 : 4174
    const response = await route.fetch({
      url: `http://localhost:${port}${original.pathname}${original.search}`,
      headers: route.request().headers(),
    })
    await route.fulfill({ response })
  })
}

export async function expectSharedState(page: Page, palette: string, locale: string): Promise<void> {
  await expect(page.locator('html')).toHaveAttribute('data-frontend-palette', palette)
  await expect(page.locator('html')).toHaveAttribute('lang', locale)
}
