# Showcase

A personal collection of interfaces and useful tools by Zeithrold, at [showcase.ztd.me](https://showcase.ztd.me).

Built with vinext App Router, React, Tailwind CSS, and Shadcn UI. Runs on a single Cloudflare Worker with its built-in static assets. No database, KV, R2, image service, or other addons. Noto fonts use the direct Google Fonts API.

## Develop and deploy

Use **pnpm only**. Node.js 24 and pnpm 11.22.0 are used for this project.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm lint
pnpm lint:css
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
pnpm deploy
```

Install the reviewed `zt` CLI with Go 1.27.1 (or a compatible Go toolchain):

```sh
go install github.com/zeithrold/tools/cmd/zt@3f9a3a7d33befc5a954ba1e86d3aa6d72e2c762f
zt sync --root . --plan
zt sync --root .
pnpm check
```

`zt.json` maps the frontend profile to required native lint, CSS, typecheck, unit, build, browser regression, accessibility/fonts and failure-evidence integration commands. `pnpm check` runs that profile once without recursion or repeated browser cases. Chromium must be installed first. Regression tests and Axe scans use separate artifact subdirectories; `pnpm test:e2e` runs both suites together when requested. `zt` retains command logs and its structured report under `.zt/artifacts/<run>/`, together with CSS results, full Axe JSON, HTML/JSON browser reports, named state captures and failure traces/screenshots/videos. The required integration gate runs `pnpm test:evidence`, which deliberately
fails an isolated unnamed-button fixture and verifies retained evidence and stopped later gates. It can also run independently after a build. CI uploads this directory even when verification fails.

The five managed Skills directories and `zt.lock.json` come from the same reviewed tools commit. Preview sync before applying it; the CLI refuses to overwrite unmanaged files or local edits. See [DESIGN.md](DESIGN.md) for this application's design and verification contract.

The published `@ztd-me/frontend-checks@0.1.3` helper and compatible `@playwright/test@1.62.0` are pinned. CSS checks enforce native syntax, semantic paint tokens, and defined custom property references. Browser checks scan both routes in every light/dark palette, translated mobile dialogs and menus, and exercise keyboard navigation and focus restoration. Captured screenshots are evidence; visual baselines and performance budgets remain deferred. The workspace enables pnpm's portable shell, release-age exclusion pruning, and `trustPolicy: no-downgrade`; the approved `@ztd-me/*` scope is exempted from the release-age gate only. The approved trust exception covers only `semver@6.3.1`, which Babel 7 requires and which lacks provenance. Build-script permission remains limited to `esbuild` and `workerd` through pnpm 11's `allowBuilds` configuration.

`pnpm start` serves the production Worker locally. `pnpm deploy` builds and deploys the Worker and its `showcase.ztd.me` Custom Domain, using your Wrangler authentication. `wrangler.jsonc` is the source deployment configuration; `dist/server/wrangler.json` is generated during build.

To check the deployed site with the same browser suite:

```sh
SHOWCASE_TEST_URL=https://showcase.ztd.me pnpm test:e2e
```

## GitHub Actions

[`CI & Deploy`](.github/workflows/deploy.yml) runs on pushes to `main` and pull requests targeting `main`. Its **Verify** job uses the shared checkout, pnpm, Node, frozen dependency install, Go 1.27.1 and pinned zt setup order. Immutable action pins match the shared convention. A separate provenance step retains the checked-out revision, lock digest and CLI/toolchain/Node/pnpm versions. Chromium setup precedes `pnpm check`, which runs every required native gate, including the failure-evidence probe. Failed native logs are shown before artifact upload. Showcase also keeps its independent real Google Fonts diagnostic when a required native prerequisite fails; it does not clear that failure.

See [the pipeline contract](docs/ci-pipeline.md) for the common sequence and Showcase's project-specific checks.

Verification lints with zero warnings, checks TypeScript, runs unit tests, builds the Worker, and runs the full browser suite against that production Worker locally. It uploads the verified `dist/` artifact named for the workflow commit. PRs only verify; the verification job has no Cloudflare credentials.

After a successful main push verification, **Deploy** automatically downloads that same run's artifact and checks out the same commit. Its boundary step checks the main-push/repository identity and built Worker/client files before deploying without rebuilding, tagged with the Git SHA. `pnpm verify:release` uses Cloudflare's authenticated API through Wrangler to verify that this exact commit serves 100% of traffic. There is no manual dispatch, confirmation, enable switch, or expected-SHA input. Stale PR checks are canceled; an active main run is never interrupted, and the latest pending main run waits for it to finish. Browser evidence and verified builds are retained for seven days.

Cloudflare challenges GitHub-hosted requests to the public domain, so post-deployment acceptance uses the authenticated Worker version and traffic checks. The CI browser suite runs against the production Worker locally, including accessibility and real Google Fonts verification. The optional deployed-site browser command above remains available for local use.

Deployment reuses the existing `CLOUDFLARE_API_TOKEN` repository secret. The account ID, `showcase` Worker, and `showcase.ztd.me` Custom Domain stay in `wrangler.jsonc`; no additional repository variables are required. Credentials and permissions are not changed by the workflow. The token is exposed only to deployment and release verification steps. Missing credentials or permission errors stop deployment without a credential fallback. Local interactive Wrangler authentication is separate from the CI credential.

All dependency, build, test, and deployment commands use pnpm. Reviewing a PR runs verification only. Merging it into main triggers automatic deployment after verification passes.

## Pages

The homepage is a directory of individual pages. `lib/pages.ts` defines the page list, currently linking to the clock at [`/clock`](https://showcase.ztd.me/clock). Each new tool gets its own route and directory entry. Language, theme, and palette settings are shared across pages and saved in browser storage.

## First tool: Time, in motion (`/clock`)

- Every changed digit slides upward independently; unchanged digits stay still.
- Local time and six selectable timezones; 12/24-hour format and optional seconds.
- Day progress, three world clocks, clipboard copy, fullscreen, and light/dark themes.
- Preferences persist in browser storage, with validation and graceful handling of unavailable storage.
- Keyboard-accessible Shadcn controls and support for reduced motion.
- English and Simplified Chinese with i18next/react-i18next, browser language detection, localized dates, and saved language preference.
- Five complete color palettes (Terracotta, Moss, Ocean, Plum, Graphite), each with light/dark variants.

The published `@ztd-me/eslint@0.1.1` config enables strict, type-aware TypeScript and React checks. Its explicit `react: { framework: 'vinext' }` profile recognizes server page/layout exports while retaining export checks on ordinary and client components. `eslint.config.js` excludes generated build and framework files only; application, configuration, verification scripts, and tests are linted. TypeScript enables `strict` and `noUncheckedIndexedAccess`. ESLint 10.11.0 and TypeScript 6.0.3 are pinned to the package's declared peer versions.

`components/page-directory.tsx` renders the homepage. `components/site-shell.tsx` supplies shared navigation; `components/preferences-provider.tsx` synchronizes saved preferences through the per-app store in `lib/preferences-store.ts`, with a stable server snapshot for hydration. `components/sliding-digit.tsx` implements the motion and `components/clock-page.tsx` composes the clock view and controls from `components/clock/`; `lib/use-current-time.ts` owns the synchronized timer and visibility subscription, and `lib/use-clock-actions.ts` owns clipboard status and fullscreen behavior. `lib/clock.ts` contains timezone formatting and preference validation. Translation resources live in `lib/locales/`; `components/i18n-provider.tsx` creates an isolated i18next instance for each rendered app. Tests cover directory navigation, cross-page preferences, rollover, noon/midnight, daylight saving offsets, motion, controls, persistence, fullscreen, localization, all color palettes, zero glyph clipping, and responsive layouts.

Editable source UI and Noto typography are documented in [source UI integration](docs/shared-frontend-migration.md). The public registry revision is pinned in `components.json` and reviewed provenance is recorded in `ui-source.lock.json`.
