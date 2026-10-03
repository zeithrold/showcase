import type { Page } from '@playwright/test'

export const GLYPHS = [
  { id: 'en', lang: 'en', family: 'Noto Sans', text: 'English typography ABC xyz 0123456789 Café' },
  { id: 'zh', lang: 'zh-CN', family: 'Noto Sans SC', text: '中文简体汉字，外观与语言。' },
  { id: 'ja', lang: 'ja', family: 'Noto Sans JP', text: '日本語 ひらがな カタカナ' },
  { id: 'ko', lang: 'ko', family: 'Noto Sans KR', text: '한국어 한글 글꼴' },
] as const

export const EMOJI = [
  { id: 'face', label: 'Smiling face', text: '😀' },
  { id: 'heart', label: 'Heart', text: '❤️' },
  { id: 'technologist', label: 'Woman technologist', text: '👩🏽‍💻' },
  { id: 'family', label: 'Family', text: '👨‍👩‍👧‍👦' },
  { id: 'rainbow', label: 'Rainbow flag', text: '🏳️‍🌈' },
  { id: 'flag', label: 'Japanese flag', text: '🇯🇵' },
] as const

export async function addSpecimens(page: Page): Promise<void> {
  await page.evaluate(({ glyphs, emoji }) => {
    const section = document.createElement('section')
    section.id = 'font-specimens'
    section.setAttribute('aria-label', 'Synthetic multilingual font verification')
    for (const { id, lang, text } of glyphs) {
      const p = document.createElement('p')
      p.id = `font-${id}`
      p.lang = lang
      p.textContent = text
      section.appendChild(p)
    }
    const bold = document.createElement('strong')
    bold.id = 'font-bold'
    bold.lang = 'zh-CN'
    bold.style.fontWeight = '600'
    bold.textContent = 'English 中文 日本語 한국어 600'
    section.appendChild(bold)
    const mixed = document.createElement('p')
    mixed.id = 'font-mixed'
    mixed.lang = 'en'
    mixed.textContent = 'Noto emoji 😀 with English 0123'
    section.appendChild(mixed)
    for (const { id, label, text } of emoji) {
      const span = document.createElement('span')
      span.id = `emoji-${id}`
      span.className = 'ztd-emoji'
      span.setAttribute('role', 'img')
      span.setAttribute('aria-label', label)
      span.textContent = text
      section.appendChild(span)
    }
    document.querySelector('main')?.appendChild(section)
  }, { glyphs: GLYPHS, emoji: EMOJI })
}
