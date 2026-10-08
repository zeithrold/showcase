# Consumer typography and translation foundation

Ordinary Noto text uses shared configurable roles: `--ztd-font-body` (18px),
`--ztd-font-control` (16px), and `--ztd-font-help` (14px). Product styles include
explicit fallback sizes while the reviewed shared-source candidate is integrated.
Small metadata and diagram labels no longer shrink to 6–13px on narrow screens.
Brand titles, clock digits, and intentional illustration sizes retain their display roles.
Tailwind utilities now own consumer layout and control sizing, while shared tokens and
primitives come from the complete Tools source inventory. Product CSS retains clock
animations, fullscreen behavior, locale-specific title typography and reduced motion.
Existing app roots, routing, persistence authority, main landmarks and palette policy
remain intact.

`lib/locales/` owns the typed English/Chinese dictionaries. `lib/i18n.ts` owns the request-local factory, typed keys (including valid plural base keys), and locale bridge. `components/i18n-provider.tsx` creates exactly one instance per root. `components/i18n/use-site-translation.ts` supplies typed application translation calls against the existing FrontendProvider locale; clock business preferences and fullscreen portal ownership are preserved.

Consumer object contracts use TypeScript `type` aliases. The project explicitly enforces
`ts/consistent-type-definitions: ["error", "type"]` during the published ESLint
transition. Required native/global declaration merging remains interface-based in
handwritten declaration files; its rule remains enforced. Generated declarations and
pinned source delivery are separate provenance boundaries.

This work preserves the current `app/`, `components/`, `lib/`, and `tests/` roots.
New translation behavior stays in named i18n modules and hooks; visual roles and
responsive utilities stay with the consumer components instead of the shared provider.

## Verification status

The Tailwind migration verifies the complete 76-file reviewed local inventory and
its dependency pins. The source guard rejects changed bytes, added files, altered
inventory digests and false public-installation claims. The final local Tailwind
browser receipt (2026-10-07 14:04 UTC) records 19 passing clock layout,
directory and keyboard scenarios with zero failures, skips or retries. Its Tools
registry payload digest is `41b4adba26b4b6a33c694c3e81a961786595c28a0d82d8471037612bfebcd053`.
The published `@ztd-me/frontend-checks@0.1.1` package uses the reviewed portable CSS
patch recorded in `patches/css-first-candidate.json`; CSS validation covers static
utilities, class composition, imports and custom-property contracts. The preserved
42-file public source pin is historical provenance, not approval of this local
candidate. Public source installation and promotion remain pending.

The earlier translation and typography acceptance below remains separate from the
final Tailwind browser receipt.

Native checks on 2026-10-06 passed full ESLint with zero warnings, the complete
project TypeScript configurations, CSS validation, and 25/25 unit tests.
The installed reviewed local candidate contains exactly 76 files. Source checks
retain the original 42-file public pin and independently verify local file bytes,
recorded adaptations, the inventory digest, atomic installation and direct dependency
pins. The local candidate is explicitly not approved as a public installation.

The native source guard and build passed. The complete 60-scenario browser suite
passed 59 immediately; its Chinese mobile accessibility scan initially observed the
language menu during its exit animation. Waiting for the closed listbox to detach
preserves every axe assertion, and that scenario then passed. After enforcing root
locale authority against caller lng/lngs/ns overrides, the latest build passed 12
focused locale, SSR, cookie, system-mode and compact-header browser regressions.

The two production/preview preference boundary tests and all three live Google Fonts
cases also passed, including English/Chinese cold and warm budgets, multilingual
weights and color Emoji. No local font-preview substitute was used. Evidence is in
`.zt/browser/foundation-regression`, `foundation-final-targeted`, `boundaries` and
`fonts`. The regular fixture ran on 4176; the font fixture accepts
`SHOWCASE_FONT_TEST_PORT` (default 4173, this run 4177), preserving the user's local
server. Disposable Wrangler test fixtures choose an ephemeral inspector port.

No security policy, check threshold, production binding, merge or deployment is
changed by this consumer foundation work.
