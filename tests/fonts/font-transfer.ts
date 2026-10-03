import type { CDPSession, Page } from '@playwright/test'

interface Face { family: string, weight?: string }
export interface FontResource {
  url: string
  kind: 'font' | 'font-css'
  status: number
  cached: boolean
  httpResponseBytes: number
  httpDecodedBodyBytes?: number
  faces: Face[]
}
interface Phase {
  responses: Map<string, Omit<FontResource, 'faces'>>
  cached: Set<string>
  bodies: Promise<void>[]
  cold: boolean
}

function isFontCss(url: string): boolean {
  return new URL(url).origin === 'https://fonts.googleapis.com'
}

function fontDeclaration(body: string): (Face & { source: string }) | undefined {
  const family = body.match(/font-family:\s*['"]([^'"]+)['"]/u)?.[1]
  const source = body.match(/url\(([^)]+)\)/u)?.[1]?.replace(/^['"]|['"]$/gu, '')
  if (family === undefined || source === undefined || family === '' || source === '') {
    return undefined
  }
  return { family, source, weight: body.match(/font-weight:\s*([^;]+)/u)?.[1] }
}

function readFamilies(css: string, url: string, families: Map<string, Face[]>): void {
  for (const [, body = ''] of css.matchAll(/@font-face\s*\{([^}]+)\}/gu)) {
    const face = fontDeclaration(body)
    if (face === undefined) {
      continue
    }
    const href = new URL(face.source, url).href
    const records = families.get(href) ?? []
    if (!records.some(record => record.family === face.family && record.weight === face.weight)) {
      records.push({ family: face.family, weight: face.weight })
    }
    families.set(href, records)
  }
}

function observeNetwork(session: CDPSession, current: () => Phase | undefined): void {
  session.on('Network.requestServedFromCache', ({ requestId }) => current()?.cached.add(requestId))
  session.on('Network.responseReceived', ({ requestId, type, response }) => {
    const phase = current()
    if (phase === undefined || (type !== 'Font' && !isFontCss(response.url))) {
      return
    }
    phase.responses.set(requestId, {
      url: response.url,
      kind: type === 'Font' ? 'font' : 'font-css',
      status: response.status,
      cached: response.fromDiskCache === true || response.fromServiceWorker === true,
      httpResponseBytes: 0,
    })
  })
  session.on('Network.loadingFinished', ({ requestId, encodedDataLength }) => {
    const response = current()?.responses.get(requestId)
    if (response !== undefined) {
      response.httpResponseBytes = encodedDataLength
    }
  })
}

export async function createFontProfiler(page: Page): Promise<(
  phase: 'cold' | 'warm',
  navigate: () => Promise<unknown>,
) => Promise<FontResource[]>> {
  const session = await page.context().newCDPSession(page)
  await session.send('Network.enable')
  let active: Phase | undefined
  const families = new Map<string, Face[]>()
  const decoded = new Map<string, number>()
  observeNetwork(session, () => active)
  page.on('response', (response) => {
    const phase = active
    if (phase?.cold !== true || (response.request().resourceType() !== 'font' && !isFontCss(response.url()))) {
      return
    }
    phase.bodies.push(response.body().then((bytes) => {
      decoded.set(response.url(), bytes.length)
      if (isFontCss(response.url())) {
        readFamilies(bytes.toString(), response.url(), families)
      }
    }))
  })
  return async (phase, navigate) => {
    active = { cold: phase === 'cold', responses: new Map(), cached: new Set(), bodies: [] }
    await navigate()
    await page.evaluate(async () => {
      document.body.getBoundingClientRect()
      await document.fonts.ready
    })
    await page.waitForLoadState('networkidle')
    await Promise.all(active.bodies)
    return Array.from(active.responses, ([id, response]) => ({
      ...response,
      cached: response.cached || active?.cached.has(id) === true,
      httpDecodedBodyBytes: decoded.get(response.url),
      faces: families.get(response.url) ?? [],
    }))
  }
}
