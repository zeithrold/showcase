# Showcase

A personal collection of interfaces and useful tools by Zeithrold, at [showcase.ztd.me](https://showcase.ztd.me).

Built with vinext App Router, React, Tailwind CSS, and Shadcn UI. Runs on a single Cloudflare Worker with its built-in static assets. No database, KV, R2, image service, or other addons. Fonts are served locally.

## Develop and deploy

Use **pnpm only**. Node.js 24 and pnpm 10.33.0 are used for this project.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
pnpm deploy
```

`pnpm start` serves the production Worker locally. `pnpm deploy` builds and deploys the Worker and its `showcase.ztd.me` Custom Domain, using your Wrangler authentication. `wrangler.jsonc` is the source deployment configuration; `dist/server/wrangler.json` is generated during build.

To check the deployed site with the same browser suite:

```sh
SHOWCASE_TEST_URL=https://showcase.ztd.me pnpm test:e2e
```

## GitHub Actions

[`CI & Deploy`](https://github.com/zeithrold/showcase/actions/workflows/deploy.yml) runs on pushes to `main`, pull requests targeting `main`, and manual dispatch. It installs the pnpm version declared in `package.json`, checks types, runs unit tests, builds the Worker, and runs the full browser suite against that production build. Successful `main` runs then deploy the same build and verify both live pages and every public bundle, manifest, stylesheet, font and icon by SHA-256. Pull requests and manual runs on other branches only run checks. Deployments are queued so an active deployment is not interrupted.

Cloudflare browser challenges block GitHub-hosted Chromium from loading the public site. The CI browser suite runs against the production Worker locally; post-deployment verification uses HTTP responses and exact asset hashes. `pnpm verify:deployment` requires the corresponding `dist/client` build. Browser tests against the public site can still be run from a network accepted by Cloudflare with the command above.

Add `CLOUDFLARE_API_TOKEN` in [repository Actions Secrets](https://github.com/zeithrold/showcase/settings/secrets/actions). The account ID and Custom Domain are already in `wrangler.jsonc`; no additional repository variables are required. The token needs these permissions, scoped to the account in that config and the `ztd.me` zone:

- Account: Workers Scripts Edit and Account Settings Read.
- Zone: Workers Routes Edit and Zone Read.

Follow [Cloudflare's CI authentication guide](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/) to create the token. Store it only as a GitHub secret, never in source. The workflow exposes it only to the deployment step. Local interactive Wrangler authentication is separate from the CI credential.

Failed browser tests retain their traces as a workflow artifact for seven days. All dependency, build, test, and deployment commands use pnpm.

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

`components/page-directory.tsx` renders the homepage. `components/site-shell.tsx` supplies shared navigation; `components/preferences-provider.tsx` owns saved preferences. `components/sliding-digit.tsx` implements the motion and `components/clock-page.tsx` contains the clock page and controls. `lib/clock.ts` contains timezone formatting and preference validation. Translation resources live in `lib/locales/`; `components/i18n-provider.tsx` creates an isolated i18next instance for each rendered app. Tests cover directory navigation, cross-page preferences, rollover, noon/midnight, daylight saving offsets, motion, controls, persistence, fullscreen, localization, all color palettes, zero glyph clipping, and responsive layouts.
