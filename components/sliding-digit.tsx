'use client'

import type { JSX } from 'react'

import { useState } from 'react'

export function SlidingDigit({ value }: { value: string }): JSX.Element {
  const [frame, setFrame] = useState({ current: value, previous: value, sequence: 0 })
  // Keep both frames in one React commit; unchanged digits retain their animation key.
  if (value !== frame.current) {
    setFrame({ current: value, previous: frame.current, sequence: frame.sequence + 1 })
  }
  return (
    <span className="sliding-digit" aria-hidden="true" data-digit={frame.current}>
      {frame.sequence > 0 && (
        <span key={`out-${frame.sequence}`} className="digit-face digit-out">
          {frame.previous}
        </span>
      )}
      <span key={`in-${frame.sequence}`} className={`digit-face ${frame.sequence > 0 ? 'digit-in' : ''}`}>
        {frame.current}
      </span>
    </span>
  )
}
