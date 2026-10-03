# Published shared frontend integration

Baseline: Showcase main `d6d78dfb896eb4ee18bbf188d211b6a6a0669ccc` (PR #4).
This application uses the promoted public registry releases `@ztd-me/frontend@0.1.0`
and `@ztd-me/frontend-checks@0.1.1` with a real frozen pnpm lockfile. The owner verified
both registry archives against tools `de4ec8fdab86c40789fdf02b82601350a12e111d` CI artifacts before integration.
The retained candidate patch and receipt have been replaced by active application code and tests.

## Ownership and behavior

The published package owns the public shell, skip link, appearance/locale controls, Inter font,
footer and validated UI preference schema. The footer contains © Zeithrold, the Showcase GitHub
repository and hello@ztd.me. Showcase owns both routes, content, About dialog, project-only navigation,
brand mark, DM Sans clock typography, assets and clock interactions. On screens below 640px, Pages
and About remain visible in a compact toolbar immediately below the shared header.

The approved defaults are Neutral + System. Terracotta, Moss, Ocean, Plum and Graphite remain
selectable in light, dark and system modes. English and Simplified Chinese application content,
metadata and clock formatting follow the shared UI locale. Root attributes and CSS media queries
render coherent appearance and translations before JavaScript, including system dark mode.
The consumer locale adapter preserves Showcase's previous Chinese browser-language fallback
(including zh-TW/zh-Hant), while retaining Accept-Language quality ordering.

`app/layout.tsx` resolves the request cookie and language using server-safe package exports.
It passes the same snapshot to document attributes, metadata, translations and the client adapter.
`components/frontend-adapter.tsx` owns the routing/framework boundary and fullscreen portal container.
Clock business tokens reference the package's declared semantic tokens; the Tailwind dark variant
uses `data-frontend-mode`. The CSS checker includes the actual package declaration file.

`lib/clock-settings-store.ts` validates and owns only timezone, format and seconds. It reads the
legacy `showcase.clock.v1` record when the current record is absent, preserves that record, and
writes `{ version: 1, timezone, format, seconds }` under `showcase.clock.settings.v1` after an
explicit clock update. The published provider separately migrates only valid legacy UI fields.
Clock data, private data and unknown fields never enter shared UI persistence. Obsolete combined
preference state, palette definitions, chrome styles and the redundant direct Inter dependency
have been removed. Existing clock formatting signatures and timezone choices remain intact.

## Deployment and storage boundaries

The non-sensitive `SHOWCASE_FRONTEND_ENVIRONMENT` application setting selects production only
when explicitly configured, using trusted `showcase.ztd.me`; forwarded Host headers cannot enable
production policy. The production Worker sets this value. Local `pnpm start` explicitly selects
development; unknown settings select preview.

Production HTTPS uses `ztd.frontend.v1; Domain=ztd.me; Path=/; SameSite=Lax; Secure` with a one-year
maximum age. It stores exactly `{ version: 1, mode, palette, locale }`; every sibling can overwrite
this untrusted UI cookie. It is never an authorization source. Sharing across subdomains refreshes
on focus or visibility, rather than relying on cross-origin localStorage notifications.

Preview uses a secure host-only `ztd.frontend.preview.showcase.v1` cookie and ignores the production
key, including when a preview is hosted under ztd.me. Development uses the isolated host-only
`ztd.frontend.development.showcase.v1` key without Secure on HTTP localhost. Denied cookies/storage
retain usable in-memory controls and observable persistence feedback; recovery re-reads valid
persisted UI selections. Future versions are not automatically rewritten by clock updates.

The existing main-only deployment guard, routes, permissions, credentials and dependency policies
are preserved. No manual deployment or merge is part of this integration. PR checks build and run
Workers locally; a feature branch or PR cannot deploy production.

## Reproducible verification

Use the declared pnpm 11.22.0, Node 24, Playwright 1.62.0 Chromium and the CI-pinned zt CLI.

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm test:evidence
```

The seven required native gates remain strict ESLint with zero warnings, CSS, TypeScript,
unit tests, production Worker build, browser regressions and full-page Axe scenarios.
`pnpm test:browser` also runs `pnpm test:preferences`, which starts separate local production
and preview Workers. Synthetic HTTPS Showcase/sibling/preview origins proxy only those local
Workers: they verify actual cookie scope, locale/appearance sharing, SSR, reload/focus recovery,
preview isolation and origin-local clock/private records without contacting live sites.

Reports, full Axe scans, named captures and failure traces/videos are retained under `.zt/artifacts/`
and uploaded by the existing always-run CI evidence step. The deliberate failure probe must retain
its evidence and mark the later required gate as not run. Browser coverage includes SSR/cache,
system changes, six palettes, both locales, storage failures, keyboard focus, menus/dialogs,
fullscreen, timers, copy, reduced motion, narrow layout and enlarged text.

These checks prove the selected Chromium states and local built-Worker boundaries. They do not
claim deployed cross-site traffic, other browser engines, assistive-technology certification,
performance budgets or visual baseline comparisons. Exact-head CI remains required for review.

## Final local validation

On 2026-10-03, frozen registry installation and all seven native frontend gates passed under
Node 24.19.0 / pnpm 11.22.0 / zt `3f9a3a7d33befc5a954ba1e86d3aa6d72e2c762f`:
zero-warning ESLint, native CSS, TypeScript, 17 unit tests, production Worker build,
49 main Chromium regressions plus two production/preview boundary regressions, and seven
accessibility scenarios containing 33 complete Axe scans with zero violations.
No browser test was skipped, unexpected or flaky. The obsolete combined-store tests were replaced
by clock-only boundary coverage and browser checks of the actual shared provider.

The deliberate failure-evidence probe passed, retaining full Axe results, capture, screenshot,
trace, video and HTML/JSON reports while preventing the later required gate from running.
Local evidence is retained in `.zt/artifacts/check-3497265220/report.json` and
`.zt/artifacts/failure-probe/check-759054578/report.json`. Named mobile-directory and Chinese
Ocean/dark clock captures were visually reviewed. These are local final-integration results;
the draft PR's independent full CI and artifacts provide the exact pushed-revision evidence.
