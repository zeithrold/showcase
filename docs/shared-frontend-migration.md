# Published shared frontend integration

Showcase pins public registry `@ztd-me/frontend@0.2.0`, `@ztd-me/frontend-checks@0.1.1`
and `@ztd-me/eslint@0.1.1` with a real frozen pnpm lockfile. No temporary archive dependency,
unpublished link, vendored shared implementation or transition patch remains.

The owner merged tools PR #9 as `1e8b408ccf165d1b0aa5eca679f9ea62a82cd1a3`, preserving the
approved `757ecc6ae77a361680efb9e5875815ff28a65146` source tree. The public frontend 0.2.0 archive
matches that approved candidate byte for byte, independently checked here against SHA-256
`0dbe39fb76dbfd7d45a3d581fb4b66f9e5546ff4736c9e85028874377fda6c5c` and the registry SRI.
The declared generic contract is documented in the package's
[upgrade guide](https://github.com/zeithrold/tools/blob/757ecc6ae77a361680efb9e5875815ff28a65146/packages/frontend/docs/upgrade-0.2.md).
All unrelated direct/transitive resolutions and original manifest ranges remain unchanged.

## Ownership and behavior

The package owns the public shell, skip link, appearance/locale controls, Inter font and validated
UI preference schema. Showcase explicitly supplies the footer's © Zeithrold, repository link,
hello@ztd.me and translated accessible source-link name through the generic footer configuration.
It also owns both routes, content, About dialog, project navigation, brand mark, DM Sans clock
font, assets and clock interactions. Below 640px, Pages and About remain visible in a compact
toolbar immediately below the shared header.

The approved defaults are Neutral + System. Terracotta, Moss, Ocean, Plum and Graphite remain
selectable in light, dark and system modes. English and Simplified Chinese content, metadata and
clock formatting follow the shared locale. Root attributes and CSS media queries render coherent
appearance/translations before JavaScript, including system dark mode. The consumer locale adapter
preserves the previous Chinese browser-language fallback, including zh-TW/zh-Hant, and quality ordering.

`app/layout.tsx` resolves cookie/language state with server-safe exports. The same snapshot feeds
root attributes, metadata, translations and the client adapter. `components/frontend-adapter.tsx`
owns the framework/routing boundary and fullscreen portal container. Clock tokens reference the
package's declared semantic tokens; the dark variant uses `data-frontend-mode`. CSS checks include
the actual package declaration file.

Clock persistence owns only timezone, format and seconds. `lib/clock-settings-store.ts` reads the
current `showcase.clock.settings.v1` record and writes `{ version: 1, timezone, format, seconds }`
under that same key after an explicit clock update. Missing, malformed and future records use
defaults without automatic writes. Clock formatting signatures and timezone choices remain intact.

Neither the shared package nor consumer contains a legacy storage-key mapping, fallback, conversion
or deletion. Existing version-1 UI cookies and clock records remain usable without migration. Old,
private and unrelated records are neither read nor written. An optional mirror writes notification
values only; it never restores state from localStorage. Unknown fields and business data never
enter shared UI persistence. Persistence writes occur after explicit changes, not initialization.

## Deployment and storage boundaries

Trusted `SHOWCASE_FRONTEND_ENVIRONMENT` selects production only when explicitly configured.
The production Worker sets it, local `pnpm start` selects development, and unknown settings select
preview. Forwarded Host headers cannot enable production sharing. `lib/frontend-policy.ts` supplies
cookie name, domain, Secure and mirror policy explicitly; the package makes no project/deployment choice.

| Environment | Cookie / notification mirror | Domain | Secure |
| --- | --- | --- | --- |
| Production | `ztd.frontend.v1` | `ztd.me` | Yes |
| Preview | `ztd.frontend.preview.showcase.v1` | Host only | Yes |
| Development | `ztd.frontend.development.showcase.v1` | Host only | No |

Cookies use Path=/, SameSite=Lax and a one-year maximum age, storing exactly version, mode, palette
and locale. Shared UI cookies are untrusted and never used for authorization. Production sibling
updates refresh on focus/visibility; cross-origin sharing does not depend on localStorage events.
Preview/development ignore the production cookie, including previews hosted under ztd.me.
Denied cookies/storage retain usable in-memory controls and observable persistence feedback;
recovery re-reads valid UI selections. Clock updates do not rewrite future UI versions.

The existing main-push-only deployment guard, routes, permissions, credentials and dependency
policies are preserved. PR/feature checks build and run Workers locally and cannot deploy production.
This integration includes no merge, manual deployment, secret, grant, infrastructure or security change.

## Reproducible verification

Use pnpm 11.22.0, Node 24, Playwright 1.62.0 Chromium and the CI-pinned zt CLI.

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm test:evidence
```

Seven required native gates run in order: zero-warning strict ESLint, CSS, TypeScript, units,
production Worker build, browser regressions and complete Axe scenarios. No rule, framework/typed
check, threshold or supply-chain policy is weakened. The helper uses its published 0.1.1 API.

Regression coverage includes current/malformed/future records, ignored old/private records, SSR/cache,
system changes, six palettes, both locales, denied-storage recovery, keyboard focus, menus/dialogs,
fullscreen, timers, copy, reduced motion, narrow layout and enlarged text. Storage audit fixtures
record all attempted accesses, including exceptions caught by application code, and assert no
initial writes, no old/private/notification reads and no unrelated writes/deletions.

`pnpm test:browser` includes `pnpm test:preferences`, using separate local production/preview Workers.
Synthetic HTTPS Showcase/sibling/preview origins proxy only these local Workers. They verify actual
cookie scope, UI sharing, locale/appearance SSR, reload/focus recovery, preview isolation and
origin-local clock/private records without contacting live sites.

Reports, complete Axe scans, named captures and failure traces/videos are retained under `.zt/artifacts/`
and uploaded by the existing always-run CI evidence step. The deliberate failure probe must retain
its evidence and mark the later required gate as not run. See `docs/shared-frontend-verification.json`
for the final registry-backed package receipt, gate outcomes and report paths.

Coverage establishes selected Chromium states and local built-Worker boundaries. Live cross-site
traffic, other browser engines, assistive-technology certification, performance budgets and visual
baseline comparisons are not claimed. Exact pushed-revision CI remains required for review.

## Final registry-backed validation

On 2026-10-03, frozen registry installation passed the unchanged supply-chain policies. All seven
native gates passed under Node 24.19.0 / pnpm 11.22.0 / pinned zt `3f9a3a7d33be`: strict lint with
zero warnings, CSS, TypeScript, 20 unit tests, production Worker build, 51 main Chromium regressions
plus two production/preview regressions, and seven accessibility scenarios with 33 complete Axe scans
and zero violations. No browser test was skipped, unexpected or flaky.

The failure-evidence probe passed by retaining a deliberate Axe failure's full scan, named capture,
screenshot, trace, video and HTML/JSON reports, and preventing the later required gate from running.
Reports are `.zt/artifacts/check-1124577957/report.json` and
`.zt/artifacts/failure-probe/check-1011489337/report.json`. Registry install logs and reviewed mobile
320px directory / Chinese Ocean-dark clock captures are retained under the first report directory.
The generic adapter preserves the approved appearance, navigation and clock behavior.
