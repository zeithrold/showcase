# Showcase

A personal collection of interfaces and useful tools by Zeithrold, at [showcase.ztd.me](https://showcase.ztd.me).

Built with vinext App Router, React, Tailwind CSS, and Shadcn UI. Runs on a single Cloudflare Worker with its built-in static assets. No database, KV, R2, image service, or other addons. Fonts are served locally.

## Develop and deploy

Use **pnpm only**. Node.js 24 and pnpm 11.22.0 are used for this project.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
pnpm deploy
```

`pnpm check` runs lint, type checking, unit tests, the build, and the browser suite in order (install Chromium first). The workspace enables pnpm's portable shell, release-age exclusion pruning, and `trustPolicy: no-downgrade`; only `@ztd-me/eslint` is exempted from the release-age gate. Build-script permission remains limited to `esbuild` and `workerd` through pnpm 11's `allowBuilds` configuration.

`pnpm start` serves the production Worker locally. `pnpm deploy` builds and deploys the Worker and its `showcase.ztd.me` Custom Domain, using your Wrangler authentication. `wrangler.jsonc` is the source deployment configuration; `dist/server/wrangler.json` is generated during build.

To check the deployed site with the same browser suite:

```sh
SHOWCASE_TEST_URL=https://showcase.ztd.me pnpm test:e2e
```

## GitHub Actions

[`CI & Deploy`](.github/workflows/deploy.yml) runs on pushes to `main` and pull requests targeting `main`. Its **Verify** job lints with zero warnings, checks TypeScript, runs unit tests, builds the Worker, and runs the full browser suite against that production Worker locally. It uploads the verified `dist/` artifact named for the workflow commit. PRs only verify; the verification job has no Cloudflare credentials.

After a successful main push verification, **Deploy** automatically downloads that same run's artifact, checks out the same commit, and deploys it without rebuilding, tagged with the Git SHA. Cloudflare's authenticated API through Wrangler then verifies that this exact commit serves 100% of traffic. There is no manual dispatch, confirmation, enable switch, or expected-SHA input. Stale PR checks are canceled; an active main run is never interrupted, and the latest pending main run waits for it to finish. Browser evidence and verified builds are retained for seven days.

Cloudflare challenges block GitHub-hosted requests to the public site. The CI browser suite runs against the production Worker locally; post-deployment verification checks the active version through Cloudflare's API. From a network accepted by Cloudflare, `pnpm verify:deployment` verifies both public pages and all public bundles, manifests, stylesheets, fonts and icons by SHA-256 against the corresponding `dist/client` build. Public browser tests can also be run with the command above.

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

The published `@ztd-me/eslint@0.1.0` config enables strict, type-aware TypeScript and React checks. `eslint.config.js` excludes generated build and framework files only; application, configuration, verification scripts, and tests are linted. TypeScript enables `strict` and `noUncheckedIndexedAccess`. ESLint 10.11.0 and TypeScript 6.0.3 are pinned to the package's declared peer versions.

`components/page-directory.tsx` renders the homepage. `components/site-shell.tsx` supplies shared navigation; `components/preferences-provider.tsx` synchronizes saved preferences through the per-app store in `lib/preferences-store.ts`, with a stable server snapshot for hydration. `components/sliding-digit.tsx` implements the motion and `components/clock-page.tsx` composes the clock view and controls from `components/clock/`; `lib/use-current-time.ts` owns the synchronized timer and visibility subscription, and `lib/use-clock-actions.ts` owns clipboard status and fullscreen behavior. `lib/clock.ts` contains timezone formatting and preference validation. Translation resources live in `lib/locales/`; `components/i18n-provider.tsx` creates an isolated i18next instance for each rendered app. Tests cover directory navigation, cross-page preferences, rollover, noon/midnight, daylight saving offsets, motion, controls, persistence, fullscreen, localization, all color palettes, zero glyph clipping, and responsive layouts.
