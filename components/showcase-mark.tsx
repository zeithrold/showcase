import type { JSX } from 'react'

const BRAND_MARK_CLASS = [
  'brand-mark flex flex-col justify-center gap-1 w-7 h-7 transform-[rotate(-12deg)] [&_span]:h-[3px]',
  '[&_span]:w-[25px] [&_span]:rounded-[3px] [&_span]:bg-accent [&_span:nth-child(2)]:w-[19px]',
  'max-[520px]:w-[23px] max-[520px]:[&_span]:w-[22px]',
].join(' ')

export function ShowcaseMark(): JSX.Element {
  return (
    <span
      className={BRAND_MARK_CLASS}
      aria-hidden="true"
    >
      <span />
      <span />
      <span />
    </span>
  )
}
