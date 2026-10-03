import type { CDPSession, Page, TestInfo } from '@playwright/test'
import { expect } from '@playwright/test'
import { EMOJI, GLYPHS } from './specimens'

export async function renderedFonts(session: CDPSession, selector: string): Promise<{
  familyName: string
  isCustomFont: boolean
  glyphCount: number
}[]> {
  const { root } = await session.send('DOM.getDocument')
  const { nodeId } = await session.send('DOM.querySelector', { nodeId: root.nodeId, selector })
  return (await session.send('CSS.getPlatformFontsForNode', { nodeId })).fonts
}

export async function assertGlyphs(session: CDPSession, info: TestInfo): Promise<void> {
  for (const { id, family } of GLYPHS) {
    const fonts = await renderedFonts(session, `#font-${id}`)
    await info.attach(`font-${id}`, { body: JSON.stringify(fonts), contentType: 'application/json' })
    expect(fonts.length).toBeGreaterThan(0)
    expect(fonts.every(font => font.isCustomFont && font.familyName.startsWith('Noto Sans'))).toBe(true)
    expect(fonts.some(font => font.familyName.startsWith(family) && font.glyphCount > 0)).toBe(true)
  }
}

export async function assertEmoji(session: CDPSession, info: TestInfo): Promise<void> {
  for (const { id } of EMOJI) {
    const fonts = await renderedFonts(session, `#emoji-${id}`)
    await info.attach(`emoji-${id}`, { body: JSON.stringify(fonts), contentType: 'application/json' })
    expect(fonts).toHaveLength(1)
    expect(fonts[0]).toMatchObject({ isCustomFont: true, familyName: 'Noto Color Emoji', glyphCount: 1 })
  }
  const mixed = await renderedFonts(session, '#font-mixed')
  expect(mixed.every(font => font.isCustomFont && /^Noto (?:Sans|Color Emoji)/u.test(font.familyName))).toBe(true)
  expect(mixed.some(font => font.familyName === 'Noto Color Emoji')).toBe(true)
  expect(mixed.some(font => font.familyName === 'Noto Sans')).toBe(true)
  await info.attach('mixed-text-fonts', { body: JSON.stringify(mixed), contentType: 'application/json' })
}

export async function assertWeight(page: Page, info: TestInfo): Promise<void> {
  const weight = await page.locator('#font-bold').evaluate((node) => {
    const canvas = document.createElement('canvas').getContext('2d')
    if (canvas === null) {
      throw new Error('Canvas metrics unavailable')
    }
    const widths = [400, 600].map((value) => {
      canvas.font = `${value} 24px "Noto Sans"`
      return canvas.measureText('English Noto weight').width
    })
    const faces = Array.from(document.fonts).filter(face => face.weight === '600' && face.status === 'loaded')
    return {
      weight: getComputedStyle(node).fontWeight,
      synthesis: getComputedStyle(node).fontSynthesis,
      faces: faces.map(face => ({ family: face.family, weight: face.weight })),
      widths,
    }
  })
  expect(weight).toMatchObject({ weight: '600', synthesis: 'none' })
  expect(weight.faces.some(face => face.family.includes('Noto Sans SC'))).toBe(true)
  expect(weight.widths[1]).not.toBe(weight.widths[0])
  await info.attach('noto-weight-evidence', { body: JSON.stringify(weight), contentType: 'application/json' })
}
