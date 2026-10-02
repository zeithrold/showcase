# Shared frontend migration preparation

Source baseline: `a1ef35eb111bd53dedc083b965f30fb4e0ecfee1` (current main after PR #3).
Preparation branch: `chore/shared-frontend-migration`.

The stable contract is verified at tools source
`7f9401ae1aae60ceb130670a9ce427f4d643df96`: [consumer README](https://github.com/zeithrold/tools/blob/7f9401ae1aae60ceb130670a9ce427f4d643df96/packages/frontend/README.md),
[draft PR #8](https://github.com/zeithrold/tools/pull/8) and
[six passing CI jobs](https://github.com/zeithrold/tools/actions/runs/37033312032).
The owner must still merge, stage and promote the package, followed by the registry smoke check.
This preparation adds no dependency placeholder, local shared-shell implementation or vendored artifact.

## Approved target

Use the shared shadcn/Radix shell with neutral grayscale as the default and retain Terracotta,
Moss, Ocean, Plum and Graphite as selectable palettes. Support light, dark and system modes,
with system as the default. Share only non-sensitive appearance and UI locale across ztd.me
subdomains, with validated/versioned data, coherent SSR/hydration, storage-failure recovery and
local/preview isolation. Keep timezone, clock format and seconds settings local to Showcase.

The shared footer must include © Zeithrold, this repository's GitHub link and hello@ztd.me.
Preserve both routes, application copy, assets, clock functionality and project-specific controls.
Keep header navigation scoped to Showcase's pages; do not add a cross-site navigation menu.
Authentication, account data and business state must never enter shared preference storage.

## Replacement points

| Existing owner | Integration work after publication |
| --- | --- |
| `app/layout.tsx` | Install the verified package CSS and provider at the vinext boundary; retain metadata and local fonts/assets. |
| `components/site-shell.tsx` | Use the published shell/main/skip-link/footer contract with the required repository and email destinations. |
| `components/site-header.tsx` | Use shared appearance/locale controls; retain project home/pages links and About content without cross-site menus. |
| `components/palette-picker.tsx` | Replace duplicated shared appearance controls through the actual exported package API. |
| `components/preferences-provider.tsx` | Give appearance and locale ownership to the package; retain project clock state and localized metadata updates. |
| `lib/preferences-context.ts` / `lib/preferences-store.ts` | Separate the local clock store from shared appearance state; preserve existing users' validated clock settings. |
| `components/i18n-provider.tsx` / `lib/i18n.ts` | Bridge the verified UI-locale contract to project translation resources and localized clock formatting. |
| `lib/clock-settings.ts` | Keep the clock-only schema and whitelist local; never send its fields to a shared cookie or store. |
| `components/clock-page.tsx` / `components/clock/` / `lib/use-clock-actions.ts` | Read local time controls and the verified locale adapter while retaining timers, copy, fullscreen, progress and world clocks. |
| `app/globals.css` / `lib/palettes.ts` / `components/ui/` | Remove duplicated shell/theme ownership after verifying actual CSS and primitive exports; retain clock-specific tokens, responsive layout and reduced motion. |

The legacy `showcase.clock.v1` record currently combines timezone/format/seconds with
appearance/locale. `readClockSettings` projects and validates only its three business fields;
existing imports through `lib/clock.ts` remain compatible during preparation. The existing
record and runtime appearance defaults remain unchanged until published-package integration.

## Prepared integration

`lib/clock-settings-store.ts` is ready to own only clock settings. It reads the legacy record
when a current clock record is absent, preserves that legacy record for the shared provider's
UI migration, and writes only `{ version: 1, timezone, format, seconds }` under
`showcase.clock.settings.v1` after an explicit clock update. Corrupt/future records are not
automatically overwritten. Storage failures preserve usable controls and mounted stores remain isolated.

The unapplied `docs/shared-frontend-integration.patch` contains consumer adapters against the
verified contract. It prepares these changes without making the active checkout depend on an
unpublished package:

- Resolve the request cookie and Accept-Language through the server-safe root exports.
- Pass exactly that snapshot into the document attributes, metadata, translation instance and provider.
- Use `PublicShell`, its fixed project footer, shared locale/appearance controls and routing adapter.
- Keep Showcase's home/pages links, About content and brand mark in consumer-owned slots.
- Bridge the resolved mode, shared locale and palette to the existing clock context and tokens.
- Give the shared provider the active fullscreen portal container and show actual persistence failures.
- Read an explicit application deployment mode rather than forwarded Host headers for cookie policy.

The proposed non-sensitive `SHOWCASE_FRONTEND_ENVIRONMENT` application setting selects production
only when explicitly configured, using the trusted `showcase.ztd.me` hostname. Unknown configurations
fall back to preview policy; local development uses its isolated namespace. The patch sets the
production Worker value and overrides local `pnpm start` to development. This uses the existing
Node compatibility behavior documented in [Cloudflare environment variables](https://developers.cloudflare.com/workers/configuration/environment-variables/#environment-variables-and-nodejs-compatibility).
No deployment route, credential, grant, CSP or CI deployment guard is changed.

The patch's syntax and clean application are checked; its package-backed types/build/browser behavior
remain unrun. After the parent's public-registry smoke succeeds, inspect the promoted package again,
install its exact verified version with pnpm, apply the patch and complete the verification checklist.
Existing browser selectors must move from palette buttons/theme toggles to the actual shared
appearance menu and from old root attributes to `data-frontend-mode`/`data-frontend-palette`.
Add consumer SSR/cache, system-mode, sharing/isolation, recovery and fullscreen-menu regressions.
Then remove obsolete chrome CSS and any redundant dependencies using the actual published lockfile.

## Verification checklist

- Install the parent's verified published version with pnpm and commit its real registry lockfile.
- Inspect actual README, exports, declarations, peers, CSS and preference schema; use no inferred APIs.
- Verify supported hosts and cookie/storage attributes from the stable contract before integration.
- Test legacy clock preservation, unknown/stale shared values, storage/cookie failures and request isolation.
- Exercise neutral plus all five retained palettes in light/dark/system, OS changes and UI locale changes.
- Test non-sensitive synchronization across intercepted test origins and isolation on local/preview hosts.
- Verify hydration, both locales, footer destinations, project-only navigation, keyboard focus and Axe states.
- Preserve every clock interaction, reduced motion, responsive fit, local assets and recovery fallback.
- Run frozen install, strict ESLint/CSS/types, unit tests, build, browser/Axe and failure-evidence checks.
- Retain evidence through the existing `zt` profile and always-run CI upload; verify the exact pushed head.
- Keep the existing main-only deployment boundary, `@ztd-me/*` age exception and every other dependency protection.

The current preparation regressions cover clock-only legacy validation, separation from private
and appearance fields, all supported timezones, independent app stores, clock preservation when
appearance/locale changes, and project-only header navigation. Cross-site sharing, neutral/system
behavior and package integration tests depend on the published contract and are not yet run.

## Preparation validation

On 2026-10-02, the frozen pnpm install and all seven native frontend gates passed: strict lint
with zero warnings, CSS lint, type checks, 22 unit tests, the production Worker build, 35 browser
regressions and 6 accessibility scenarios covering 26 Axe scans. The new named clock capture
confirms Chinese locale, Ocean/dark appearance and preserved Tokyo/12-hour/seconds-off controls.
The intentional failure-evidence probe also passed, verifying Axe, screenshot, trace, video and
report retention. Evidence is retained locally under `.zt/artifacts/check-3091914893` and
`.zt/artifacts/failure-probe/check-3298227216`.

This validates the preparation against current dependencies. Package integration and its new
sharing/default-mode behavior still require the verified published contract, a fresh frozen
install, final checks and exact-head PR CI. The deployment workflow and dependency protections
are unchanged; deployment remains restricted to this repository's main-branch push events.

All repository documentation, commit and PR text is English; supported application translations
remain bilingual. No merges, manual deployment, credential changes or npm promotion are part of
this task. Visual baselines and performance budgets remain deferred.
