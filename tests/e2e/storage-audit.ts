import type { Page } from '@playwright/test'

declare global {
  interface Window {
    showcaseStorageAudit: {
      reads: string[]
      writes: string[]
      records: () => Record<string, string | null>
    }
  }
}

export async function auditPreferenceStorage(page: Page, currentClock: boolean): Promise<void> {
  await page.addInitScript((withCurrent) => {
    const storage = window.localStorage
    const clockKey = 'showcase.clock.settings.v1'
    const mirrorKey = 'ztd.frontend.development.showcase.v1'
    const old = JSON.stringify({ timezone: 'Asia/Tokyo', theme: 'dark', palette: 'plum', locale: 'zh-CN' })
    const records = {
      'showcase.clock.v1': old,
      'ztd.home.v1': old,
      'locale': 'zh-CN',
      'synthetic.business.record': JSON.stringify({ token: 'synthetic-private' }),
    }
    for (const [key, value] of Object.entries(records)) {
      storage.setItem(key, value)
    }
    if (withCurrent) {
      storage.setItem(clockKey, JSON.stringify({ version: 1, timezone: 'UTC', format: '12', seconds: false }))
    }
    const reads: string[] = []
    const writes: string[] = []
    window.showcaseStorageAudit = {
      reads,
      writes,
      records: () => Object.fromEntries(Object.keys(records).map(key => [
        key,
        storage.getItem(key),
      ])),
    }
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem(key: string) {
          reads.push(key)
          if (key !== clockKey) {
            throw new Error(`Unexpected storage read: ${key}`)
          }
          return storage.getItem(key)
        },
        setItem(key: string, value: string) {
          writes.push(key)
          if (key !== clockKey && key !== mirrorKey) {
            throw new Error(`Unexpected storage write: ${key}`)
          }
          storage.setItem(key, value)
        },
        removeItem(key: string) { writes.push(`remove:${key}`) },
        clear() { writes.push('clear') },
      },
    })
  }, currentClock)
}

export async function preferenceStorageAudit(page: Page): Promise<{
  reads: string[]
  writes: string[]
  records: Record<string, string | null>
}> {
  return await page.evaluate(() => ({
    reads: window.showcaseStorageAudit.reads,
    writes: window.showcaseStorageAudit.writes,
    records: window.showcaseStorageAudit.records(),
  }))
}
