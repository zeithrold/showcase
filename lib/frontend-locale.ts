// Preserve Showcase's existing Chinese browser-language fallback without losing q values.
export function showcaseAcceptLanguage(header: string): string {
  return header.split(',').map((part) => {
    const [tag = '', ...parameters] = part.split(';')
    const language = /^zh(?:-|$)/iu.test(tag.trim()) ? 'zh-CN' : tag
    return [
      language,
      ...parameters,
    ].join(';')
  }).join(',')
}
