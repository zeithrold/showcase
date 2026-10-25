import type { CDPSession, Page } from '@playwright/test'
import { Buffer } from 'node:buffer'

type Face = { family: string, weight?: string }
export type FontResource = {
  url: string
  kind: 'font' | 'font-css'
  status: number
  cached: boolean
  httpResponseBytes: number
  httpDecodedBodyBytes?: number
  faces: Face[]
}
type Phase = {
  responses: Map<string, Omit<FontResource, 'faces'>>
  cached: Set<string>
  /** Font and font-CSS requests that started but have not finished yet. */
  pending: Set<string>
  bodies: Promise<void>[]
  cold: boolean
}

const defaultSettleTimeoutMs = 15_000

function isFontCss(url: string): boolean {
  return new URL(url).origin === 'https://fonts.googleapis.com'
}

function fontKind(url: string, resourceType: string | undefined): FontResource['kind'] | undefined {
  if (isFontCss(url)) {
    return 'font-css'
  }
  if (resourceType === 'Font' || new URL(url).hostname === 'fonts.gstatic.com') {
    return 'font'
  }
  return undefined
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

type Probe = {
  session: CDPSession
  current: () => Phase | undefined
  settled: () => void
  decoded: (url: string, bytes: Buffer) => void
}

function releaseIfSettled(probe: Probe, phase: Phase): void {
  if (phase.pending.size === 0) {
    probe.settled()
  }
}

function readDecodedBody(probe: Probe, phase: Phase, requestId: string, response: Omit<FontResource, 'faces'>): void {
  if (!phase.cold) {
    return
  }
  phase.bodies.push(probe.session.send('Network.getResponseBody', { requestId })
    .then(({ body, base64Encoded }) => {
      probe.decoded(response.url, Buffer.from(body, base64Encoded ? 'base64' : 'utf8'))
    }))
}

function observeNetwork(probe: Probe): void {
  const { session } = probe
  session.on('Network.requestServedFromCache', ({ requestId }) => probe.current()?.cached.add(requestId))
  session.on('Network.requestWillBeSent', ({ requestId, request, type }) => {
    const phase = probe.current()
    const kind = fontKind(request.url, type)
    if (phase === undefined || kind === undefined) {
      return
    }
    phase.pending.add(requestId)
    phase.responses.set(requestId, { url: request.url, kind, status: 0, cached: false, httpResponseBytes: 0 })
  })
  session.on('Network.responseReceived', ({ requestId, response }) => {
    const tracked = probe.current()?.responses.get(requestId)
    if (tracked !== undefined) {
      tracked.status = response.status
      tracked.cached = tracked.cached || response.fromDiskCache === true
        || response.fromServiceWorker === true
    }
  })
  // A failed font request stays out of the budget sample, as before, but must stop
  // holding the phase open.
  session.on('Network.loadingFailed', ({ requestId }) => {
    const phase = probe.current()
    if (phase === undefined) {
      return
    }
    phase.pending.delete(requestId)
    phase.responses.delete(requestId)
    releaseIfSettled(probe, phase)
  })
  session.on('Network.loadingFinished', ({ requestId, encodedDataLength }) => {
    const phase = probe.current()
    if (phase === undefined) {
      return
    }
    phase.pending.delete(requestId)
    const response = phase.responses.get(requestId)
    if (response !== undefined) {
      response.httpResponseBytes = encodedDataLength
      readDecodedBody(probe, phase, requestId, response)
    }
    releaseIfSettled(probe, phase)
  })
}

// A wait that must not outlive the sample's settlement deadline. The losing branch
// keeps its own handler, so a held request cannot reject unhandled later.
async function bounded<T>(work: Promise<T>, deadline: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      work,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(message))
        }, Math.max(0, deadline - Date.now()))
      }),
    ])
  }
  finally {
    clearTimeout(timer)
  }
}

// `document.fonts.ready` covers faces the document already uses; one further paint
// discovers @font-face rules added after that promise resolved. Bounded so a held
// font file cannot outlive the sample.
async function settlePaint(page: Page, deadline: number, message: string): Promise<void> {
  await bounded(page.evaluate(async () => {
    // Force layout so @font-face rules are applied before the font set is read.
    document.body.getBoundingClientRect()
    await document.fonts.ready
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        resolve()
      })
    })
  }), deadline, message)
}

// Resolves once the phase has no font traffic left instead of waiting for the whole
// page to reach a network-idle window. Every wait shares one deadline, so a font file
// or stylesheet that never finishes fails the sample instead of hanging the suite.
function createSettlement(
  page: Page,
  current: () => Phase | undefined,
  timeoutMs: number,
): { settle: () => Promise<void>, notify: () => void } {
  let waiting: (() => void)[] = []
  const notify = (): void => {
    const resume = waiting
    waiting = []
    for (const settled of resume) {
      settled()
    }
  }
  const pendingCleared = async (phase: Phase, remaining: number): Promise<void> => {
    if (phase.pending.size === 0) {
      return
    }
    await new Promise<void>((resolve) => {
      let timer: ReturnType<typeof setTimeout> | undefined
      const done = (): void => {
        clearTimeout(timer)
        const index = waiting.indexOf(done)
        if (index !== -1) {
          waiting.splice(index, 1)
        }
        resolve()
      }
      timer = setTimeout(done, remaining)
      waiting.push(done)
    })
  }
  const settle = async (): Promise<void> => {
    const deadline = Date.now() + timeoutMs
    const message = `Font requests did not settle within ${timeoutMs}ms`
    for (;;) {
      const phase = current()
      if (phase === undefined) {
        return
      }
      // Checked before every wait, so an exhausted budget always ends the sample.
      const remaining = deadline - Date.now()
      if (remaining <= 0) {
        throw new Error(message)
      }
      if (phase.pending.size > 0) {
        await pendingCleared(phase, remaining)
        continue
      }
      // `document.fonts.ready` covers faces the document already uses; one further
      // paint discovers @font-face rules added after that promise resolved.
      await settlePaint(page, deadline, message)
      const after = current()
      if (after === undefined || after.pending.size === 0) {
        return
      }
    }
  }
  return { settle, notify }
}

export type FontProfilerOptions = {
  /** Bound for one sample's font settlement. Tests can shorten it to prove failure. */
  settleTimeoutMs?: number
}

export async function createFontProfiler(page: Page, options: FontProfilerOptions = {}): Promise<(
  phase: 'cold' | 'warm',
  navigate: () => Promise<unknown>,
) => Promise<FontResource[]>> {
  const settleTimeout = options.settleTimeoutMs ?? defaultSettleTimeoutMs
  const session = await page.context().newCDPSession(page)
  await session.send('Network.enable')
  let active: Phase | undefined
  const families = new Map<string, Face[]>()
  const decoded = new Map<string, number>()
  const settlement = createSettlement(page, () => active, settleTimeout)
  const recordDecoded = (url: string, bytes: Buffer): void => {
    decoded.set(url, bytes.length)
    if (isFontCss(url)) {
      readFamilies(bytes.toString(), url, families)
    }
  }
  observeNetwork({ session, current: () => active, settled: settlement.notify, decoded: recordDecoded })
  return async (phase, navigate) => {
    const sample: Phase = {
      cold: phase === 'cold',
      responses: new Map(),
      cached: new Set(),
      pending: new Set(),
      bodies: [],
    }
    active = sample
    await navigate()
    // The layout read and `document.fonts.ready` wait live inside the bounded paint
    // step, so no part of a sample can outlive its settlement deadline.
    await settlement.settle()
    await Promise.all(sample.bodies)
    return Array.from(sample.responses, ([id, response]) => ({
      ...response,
      cached: response.cached || sample.cached.has(id) === true,
      httpDecodedBodyBytes: decoded.get(response.url),
      faces: families.get(response.url) ?? [],
    }))
  }
}
