'use client'

import type { JSX } from 'react'

import { useState } from 'react'

const SLIDING_DIGIT_CLASS = [
  'sliding-digit inline-block relative shrink-0 w-[.64em] h-[1.12em] overflow-hidden',
  '[contain:layout_paint]',
].join(' ')

const DIGIT_FACE_CLASS = [
  'digit-face digit-out absolute [inset:0] flex items-center justify-center [will-change:transform]',
  'motion-reduce:hidden',
].join(' ')

const DIGIT_FACE_CLASS_1 = [
  'digit-face absolute [inset:0] flex items-center justify-center [will-change:transform]',
].join(' ')

export function SlidingDigit({ value }: { value: string }): JSX.Element {
  const [frame, setFrame] = useState({ current: value, previous: value, sequence: 0 })
  // Keep both frames in one React commit; unchanged digits retain their animation key.
  if (value !== frame.current) {
    setFrame({ current: value, previous: frame.current, sequence: frame.sequence + 1 })
  }
  return (
    <span
      className={SLIDING_DIGIT_CLASS}
      aria-hidden="true"
      data-digit={frame.current}
    >
      {frame.sequence > 0 && (
        <span
          key={`out-${frame.sequence}`}
          className={DIGIT_FACE_CLASS}
        >
          {frame.previous}
        </span>
      )}
      <span key={`in-${frame.sequence}`} className={`${DIGIT_FACE_CLASS_1} ${frame.sequence > 0 ? 'digit-in' : ''}`}>
        {frame.current}
      </span>
    </span>
  )
}
