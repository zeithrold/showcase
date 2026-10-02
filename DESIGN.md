# Showcase design and verification contract

The directory and clock retain Showcase's quiet editorial layout, local Inter and DM Sans fonts,
compact controls, English/Simplified Chinese copy, and Terracotta, Moss, Ocean, Plum and Graphite
palettes. Each palette supports light and dark modes. This work preserves the clock's timing,
timezone and formatting APIs, sliding digits, world clocks, clipboard/fullscreen fallbacks,
reduced-motion behavior, and saved `showcase.clock.v1` preferences.

## Tokens and components

`app/globals.css` owns semantic background, foreground, card, subtle, muted-text, border, accent,
seconds, clock and accessible accent-text tokens. Light-mode text tones meet contrast against
background/card/subtle surfaces while decorative accent colors retain their original values.
Selection and shadow colors are also named tokens. Tailwind's theme
CSS supplies its imported token declarations; the CSS check names that source explicitly.
There are no runtime custom-property exemptions. Shadcn/Radix primitives provide translated,
labeled controls, dialog focus trapping and select keyboard behavior. Project CSS supplies the
palette and responsive layouts; the clock has a named timer role with live announcements off.
Open selects make Radix-hidden background regions inert and restore only the inert state they
own on close, preserving existing inert regions. Native Slot composition preserves forwarded
refs and React 19 cleanup callbacks. Components do not replace those choices with a shared theme.

## Verification and evidence

`pnpm check` runs the required `zt.json` frontend profile once. Its leaf commands never call
`check`. Strict ESLint 0.1.1, CSS syntax/token validation, TypeScript, unit tests and the Worker
build precede Chromium regressions and a separate Axe suite. No accessibility findings are
ignored and the helper's default WCAG A/AA tags remain enabled.

The suite covers actual directory and clock routes, each light/dark palette, translated mobile
controls/dialogs/menus, persisted preferences, storage and browser API recovery, responsive
reflow, digit clipping, reduced motion and keyboard focus/navigation. State screenshots and
complete Axe results are retained with reports and failure traces/videos under the check run.
Clock captures fix the displayed date while browser timers and animation frames continue, so
paused test clocks do not produce unpainted digit images. Popup scans await native animations.
An isolated deliberate unnamed-button failure verifies complete Axe JSON, state and failure
screenshots, HTML/JSON reports, video, trace, nonzero gate status and later `not_run` status.
`pnpm test:evidence` runs this probe locally and in CI; its expected failure is validated rather
than applied to the application suite. CI uploads those artifacts on failures and retains the
verified Worker for main-only deployment.

Axe automation and observed Chromium captures support this scope; they are not a complete
assistive-technology or cross-browser certification. Visual baseline management and performance
budgets are deferred. No baseline is automatically approved from a captured screenshot.
