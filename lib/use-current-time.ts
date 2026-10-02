import { useState, useSyncExternalStore } from 'react'

function createClockStore() {
  let now: Date | null = null
  const subscribe = (listener: () => void) => {
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      clearTimeout(timer)
      now = new Date()
      listener()
      timer = setTimeout(tick, 1000 - Date.now() % 1000 + 5)
    }
    const onVisibility = () => {
      if (!document.hidden) {
        tick()
      }
    }
    tick()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }
  return { subscribe, getSnapshot: () => now, getServerSnapshot: () => null }
}

export function useCurrentTime(): Date | null {
  const [store] = useState(createClockStore)
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot)
}
