'use client'

function inertHiddenBackground(content: HTMLElement): () => void {
  const owned = new Set<HTMLElement>()
  const body = content.ownerDocument.body
  const synchronize = (): void => {
    for (const element of owned) {
      if (element.dataset.ariaHidden !== 'true') {
        element.inert = false
        owned.delete(element)
      }
    }
    for (const element of body.querySelectorAll<HTMLElement>('[data-aria-hidden="true"]')) {
      if (!element.inert && !element.contains(content)) {
        element.inert = true
        owned.add(element)
      }
    }
  }
  const observer = new MutationObserver(synchronize)
  observer.observe(body, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-aria-hidden'] })
  synchronize()
  return () => {
    observer.disconnect()
    for (const element of owned) {
      element.inert = false
    }
  }
}

export function inertSelectBackground(content: HTMLDivElement | null): (() => void) | undefined {
  return content === null ? undefined : inertHiddenBackground(content)
}
