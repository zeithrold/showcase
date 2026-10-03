# Generic shared frontend correction preparation

**PR #5 is blocked pending frontend 0.2.0 publication and registry verification.**
The owner requires no legacy storage-key mappings in the package or consumers. Current dependency
`@ztd-me/frontend@0.1.0` cannot satisfy that requirement: its provider reads a project-specific legacy
key during connection and exposes no opt-out. Its policy also uses the fixed `Project` union,
`namespace` selection and a hard-coded ztd.me domain, while its footer assumes fixed destinations.
The replacement API has now passed exact-source consumer validation as described below. Its
adapter is retained as an unapplied patch until the owner completes the public-registry gate.
No unpublished replacement or temporary tarball dependency is committed.

Baseline: Showcase main `d6d78dfb896eb4ee18bbf188d211b6a6a0669ccc` (PR #4).
This application uses the promoted public registry releases `@ztd-me/frontend@0.1.0`
and `@ztd-me/frontend-checks@0.1.1` with a real frozen pnpm lockfile. The owner verified
both registry archives against tools `de4ec8fdab86c40789fdf02b82601350a12e111d` CI artifacts before integration.
The original 0.1.0 candidate patch and receipt were replaced by active application code and tests.

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

`lib/clock-settings-store.ts` validates and owns only timezone, format and seconds. It reads only
the current `showcase.clock.settings.v1` record and writes `{ version: 1, timezone, format, seconds }`
under that same key after an explicit clock update. Absent, malformed and future records use defaults
without automatic writes. No old-key fallback, conversion or deletion remains in this consumer.
The current published provider's separate legacy UI migration remains a package blocker.
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

## Previous published integration validation

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

That validation belongs to commit `f84bc53bd39a23acb394dd199e3bfdda2fb52f0c`, whose
[CI passed](https://github.com/zeithrold/showcase/actions/runs/37082237498) with deployment skipped.
It establishes the previous contract's behavior, not compliance with the subsequent generic-only
correction. The preparation removes consumer fallback reads, changes positive browser fixtures to
current UI cookies/clock records, and retains negative tests proving unrelated old/private records
are neither read by the clock store nor rewritten. Complete UI-level legacy-ignore coverage and
generic policy/footer integration were pending at that earlier step. Existing new-format preferences remain usable.

## Generic correction preparation validation against published 0.1.0

The consumer clock fallback removal and current-format fixture changes pass all seven native gates
against the still-published frontend 0.1.0: zero-warning ESLint, CSS, types, 17 unit tests, production
Worker build, 51 Chromium regressions and seven accessibility scenarios with 33 complete Axe scans
and zero violations. The failure-evidence probe passes. Reports are retained in
`.zt/artifacts/check-3784182436/report.json` and
`.zt/artifacts/failure-probe/check-2689024628/report.json`.
No application source maps or reads an old preference key. Such key references remain only in
negative unit fixtures proving non-use/non-mutation. The upstream 0.1.0 provider's legacy path
still blocks the complete requirement; generic-source validation and corrected registry adoption
were pending at this preparation step. No old/private record has been deleted.

## Exact-source frontend 0.2.0 validation

Tools [PR #9](https://github.com/zeithrold/tools/pull/9), source
`757ecc6ae77a361680efb9e5875815ff28a65146`, defines the generic contract in
[upgrade-0.2.md](https://github.com/zeithrold/tools/blob/757ecc6ae77a361680efb9e5875815ff28a65146/packages/frontend/docs/upgrade-0.2.md).
The source archive's package was installed frozen and packed without source changes.
Its SHA-256 matches the parent's reviewed CI archive exactly:
`0dbe39fb76dbfd7d45a3d581fb4b66f9e5546ff4736c9e85028874377fda6c5c`.
The resulting tarball was installed only in a disposable checkout at consumer baseline
`e9c892761008600fa3caf9e70b2ab69056ff06cc`; its subsequent frozen install also passed.
Age, trust and build protections remain intact, and the consumer uses unpatched Radix runtime/types.

`docs/shared-frontend-generic-integration.patch` contains the tested source adapters and regressions,
with no manifest placeholder, temporary dependency, vendored implementation or generated lockfile:

- `showcasePreferencePolicy` explicitly supplies existing cookie names, production domain, Secure
  policy and notification mirror names; none of these choices is inferred by the shared package.
- The shell supplies © Zeithrold, this repository, hello@ztd.me and localized GitHub accessible names
  through the generic footer configuration. Existing branding, slots and navigation remain local.
- Storage audit fixtures record all attempts, including errors caught by application code. They
  reject reads of old/private/notification keys and permit only current clock reads and explicit
  current clock/mirror writes. Mounting performs no persistence writes; old records remain intact.
- Existing version-1 UI cookies and current clock records survive initialization, updates and reload
  without conversion. Missing new-format preferences use approved defaults and ignore old values.

All seven native gates pass: zero-warning ESLint, CSS, TypeScript, 20 unit tests, production Worker
build, 51 main Chromium regressions plus two production/preview boundary regressions, and seven
accessibility scenarios with 33 complete Axe scans and zero violations. No browser test was skipped,
unexpected or flaky. SSR/cache, system mode before JavaScript, both locales, palette/clock behavior,
denied-storage recovery, fullscreen/keyboard paths and explicit sharing/isolation remain covered.
The failure-evidence probe also passes. Retained mobile and Chinese Ocean/dark clock captures were
visually reviewed; no additional UI behavior change is introduced by the generic adapter.

See `docs/shared-frontend-generic-verification.json` for exact archive/patch hashes and outcomes.
Reports, captures, full scans, traces/videos, source install/pack and consumer logs are retained under
`.zt/artifacts/frontend-generic-757ecc6`. These are disposable candidate results; branch CI continues
to test the currently published 0.1.0 application until final adoption.

No consumer compatibility blocker remains. After owner merge/promotion and successful public-registry
smoke for exact frontend 0.2.0, install that registry version with pnpm while retaining unrelated
resolutions, apply the patch, commit the real registry lockfile and repeat all gates and exact-head CI.
The same draft PR stays blocked on that publication boundary; no merge or manual deployment occurred.
