# Consumer typography and translation foundation

Ordinary Noto text uses shared configurable roles: `--ztd-font-body` (18px),
`--ztd-font-control` (16px), and `--ztd-font-help` (14px). Product styles include
explicit fallback sizes alongside the verified public shared source.
Small metadata and diagram labels no longer shrink to 6–13px on narrow screens.
Brand titles, clock digits, and intentional illustration sizes retain their display roles.
Tailwind utilities now own consumer layout and control sizing, while shared tokens and
primitives come from the complete Tools source inventory. Product CSS retains clock
animations, fullscreen behavior, locale-specific title typography and reduced motion.
Existing app roots, routing, persistence authority, main landmarks and palette policy
remain intact. Previously floating `latest` toolchain dependencies are now pinned to
their existing resolved versions, keeping runtime versions stable when regenerating
the lockfile for the official Tools packages.

`lib/locales/` owns the typed English/Chinese dictionaries. `lib/i18n.ts` owns the request-local factory, typed keys (including valid plural base keys), and locale bridge. `components/i18n-provider.tsx` creates exactly one instance per root. `components/i18n/use-site-translation.ts` supplies typed application translation calls against the existing FrontendProvider locale; clock business preferences and fullscreen portal ownership are preserved.

Consumer object contracts use TypeScript `type` aliases. The official `@ztd-me/eslint@0.1.4` package enforces
`ts/consistent-type-definitions: ["error", "type"]`. Required native/global declaration merging remains interface-based in
handwritten declaration files; its rule remains enforced. Generated declarations and
pinned source delivery are separate provenance boundaries.

This work preserves the current `app/`, `components/`, `lib/`, and `tests/` roots.
New translation behavior stays in named i18n modules and hooks; visual roles and
responsive utilities stay with the consumer components instead of the shared provider.

## Source and verification boundaries

`ui-source.lock.json` pins the complete 77-file public Tools UI graph at
[`9abea5a57b97f63109fb7dc5255543b53629c3ba`](https://github.com/zeithrold/tools/tree/9abea5a57b97f63109fb7dc5255543b53629c3ba).
Its payload SHA256 is
`0ea6c065dc4da6608fb8b2beb817b8607c03ad694f40af1a49160971c804ddd4`.
The [public-source CI gate](https://github.com/zeithrold/tools/actions/runs/37713345587)
performed a fresh `shadcn@4.21.1` install, checked every public byte and license,
and passed native lint/CSS/types, 14 source-consumer units and 32 real browser cases
with actual Google Fonts. `docs/ui-public-installation.json` preserves its receipt
with a final newline; the source lock records both the original CI receipt hash and
the checked-in receipt hash.

The source guard checks that receipt, upstream and installed hashes, the complete
inventory digest, reviewed adaptations, atomic delivery and exact dependency pins.
It rejects altered bytes, extra files, changed inventory digests and unverified
installation claims. The installed graph is a verified public source rather than a
local candidate. Source updates require a new verified full commit and reviewed
inventory; normal checks use the committed evidence without network access.

All 77 delivered files match the public graph without local adaptations. The
published `@ztd-me/frontend-checks@0.1.3` validates static Tailwind utilities,
class composition, CSS imports and token contracts. No Tools-owned npm package
patch or package extension is installed. Radix and Vaul retain the reviewed
third-party compatibility patches.

Run `pnpm check:ui`, `pnpm lint`, `pnpm lint:css`, `pnpm typecheck`,
`pnpm test` and `pnpm build` for source identity and the native application gates.
Real browser tests preserve clock settings, desktop and narrow layouts, keyboard
navigation, fullscreen portal ownership, preference isolation and accessibility.
Google Fonts tests use actual API responses and enforce the existing byte budgets.
Run-specific reports remain in ignored `.zt/` directories and PR validation.
No security policy, check threshold or production binding changes.
