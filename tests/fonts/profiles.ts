import type { TestInfo } from '@playwright/test'
import type { FontResource } from './font-transfer'
import process from 'node:process'
import { expect } from '@playwright/test'

function phaseBudget(phase: 'cold' | 'warm', coldCap?: number): number | undefined {
  if (coldCap === undefined) {
    return undefined
  }
  return phase === 'cold' ? coldCap : 10_000
}

function summarize(resources: FontResource[]): Record<string, {
  requests: number
  encoded: number
  decoded: number
  cached: number
}> {
  const byFamily: ReturnType<typeof summarize> = {}
  for (const resource of resources) {
    const names = Array.from(new Set(resource.faces.map(face => face.family))).join(', ')
    const family = names === '' ? resource.kind : names
    const row = byFamily[family] ?? { requests: 0, encoded: 0, decoded: 0, cached: 0 }
    row.requests++
    row.encoded += resource.httpResponseBytes
    row.decoded += resource.httpDecodedBodyBytes ?? 0
    row.cached += Number(resource.cached)
    byFamily[family] = row
  }
  return byFamily
}

export async function reportProfile(
  info: TestInfo,
  scenario: string,
  phase: 'cold' | 'warm',
  input: { resources: FontResource[], coldCap?: number },
): Promise<void> {
  const { resources, coldCap } = input
  const localPreview = process.env.SHOWCASE_LOCAL_FONT_PREVIEW === '1'
  expect(resources.every(resource => resource.status === 200 || resource.status === 304)).toBe(true)
  const fonts = resources.filter(resource => resource.kind === 'font')
  expect(fonts.length).toBeGreaterThan(0)
  expect(fonts.length).toBeLessThan(80)
  expect(fonts.every(resource => resource.faces.length > 0)).toBe(true)
  expect(resources.some(resource => resource.kind === 'font-css')).toBe(true)
  const httpResponseBytes = resources.reduce((total, resource) => total + resource.httpResponseBytes, 0)
  const cap = phaseBudget(phase, coldCap)
  await info.attach(`${scenario}-${phase}-font-profile`, {
    body: JSON.stringify({
      scenario,
      phase,
      localPreview,
      fontVerification: localPreview ? 'isolated-cloud-preview' : 'google-fonts-api',
      httpResponseBytes,
      budgetBytes: cap ?? null,
      remoteBudgetEnforced: !localPreview && cap !== undefined,
      decodedBodySource: phase === 'cold' ? 'current-response' : 'previous-cold-response-body',
      byFamily: summarize(resources),
      resources,
    }),
    contentType: 'application/json',
  })
  if (!localPreview && cap !== undefined) {
    expect(httpResponseBytes).toBeLessThanOrEqual(cap)
  }
}
