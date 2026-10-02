import type { ClockPreferences } from './clock'
import { useEffect, useRef, useState } from 'react'
import { formatClock } from './clock'

interface FullscreenState {
  focused: boolean
  stageElement: HTMLElement | null
  setStageElement: (element: HTMLElement | null) => void
  toggleFullscreen: () => Promise<void>
}

export function useFullscreen(): FullscreenState {
  const [focused, setFocused] = useState(false)
  const [stageElement, setStageElement] = useState<HTMLElement | null>(null)
  useEffect(() => {
    const onFullscreen = () => setFocused(document.fullscreenElement !== null)
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && document.fullscreenElement === null) {
        setFocused(false)
      }
    }
    document.addEventListener('fullscreenchange', onFullscreen)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('fullscreenchange', onFullscreen)
      document.removeEventListener('keydown', onEscape)
    }
  }, [])
  const toggleFullscreen = async () => {
    if (document.fullscreenElement !== null) {
      await document.exitFullscreen()
      return
    }
    if (focused) {
      setFocused(false)
      return
    }
    try {
      if (stageElement === null || typeof stageElement.requestFullscreen !== 'function') {
        setFocused(true)
        return
      }
      await stageElement.requestFullscreen()
    }
    catch { setFocused(true) }
  }
  return { focused, stageElement, setStageElement, toggleFullscreen }
}

type CopyStatus = '' | 'copied' | 'unavailable'
interface ClipboardState {
  copyStatus: CopyStatus
  copyTime: () => Promise<void>
}

export function useCopyTime(now: Date | null, timezone: string, preferences: ClockPreferences): ClipboardState {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('')
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => {
    if (copyTimerRef.current !== null) {
      clearTimeout(copyTimerRef.current)
    }
  }, [])
  const copyTime = async () => {
    if (now === null) {
      return
    }
    try {
      await navigator.clipboard.writeText(formatClock(
        now,
        timezone,
        preferences.format,
        preferences.seconds,
        preferences.locale,
      ))
      setCopyStatus('copied')
    }
    catch { setCopyStatus('unavailable') }
    if (copyTimerRef.current !== null) {
      clearTimeout(copyTimerRef.current)
    }
    copyTimerRef.current = setTimeout(setCopyStatus, 2500, '')
  }
  return { copyStatus, copyTime }
}
