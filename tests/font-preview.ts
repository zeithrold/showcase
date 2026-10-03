import type { BrowserContext } from '@playwright/test'
import type { Buffer } from 'node:buffer'
import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, readFile, rename } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { promisify } from 'node:util'

const run = promisify(execFile)
const pending = new Map<string, Promise<Buffer>>()
const previewAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 '
  + 'Chrome/151.0.0.0 Safari/537.36'

async function officialBytes(url: string): Promise<Buffer> {
  const directory = path.resolve('.zt/font-preview')
  await mkdir(directory, { recursive: true })
  const name = createHash('sha256').update(previewAgent + url).digest('hex')
  const file = path.join(directory, name)
  try {
    return await readFile(file)
  }
  catch {
    const temporary = `${file}.${process.pid}`
    await run('curl', [
      '--fail',
      '--silent',
      '--show-error',
      '--location',
      '--max-time',
      '30',
      '--user-agent',
      previewAgent,
      '--output',
      temporary,
      url,
    ])
    await rename(temporary, file)
    return await readFile(file)
  }
}

export async function prepareFontPreview(context: BrowserContext): Promise<void> {
  if (process.env.SHOWCASE_LOCAL_FONT_PREVIEW !== '1') {
    return
  }
  if (process.env.GITHUB_ACTIONS === 'true') {
    throw new Error('CI requires real Google Fonts; isolated Cloud preview is forbidden')
  }
  await context.route(/^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//u, async (route) => {
    const url = route.request().url()
    const promise = pending.get(url) ?? officialBytes(url)
    pending.set(url, promise)
    const body = await promise
    const css = new URL(url).hostname === 'fonts.googleapis.com'
    await route.fulfill({
      body,
      contentType: css ? 'text/css' : 'font/woff2',
      headers: { 'access-control-allow-origin': '*', 'x-showcase-font-verification': 'isolated-cloud-preview' },
    })
  })
}
