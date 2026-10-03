# Showcase pipeline contract

Showcase follows the owner's website/showcase/Memory convention, using Website's
[reviewed comparison](https://github.com/zeithrold/website/blob/d98f3a4a6d35988b8e7d9ca7f8b37615e6531b35/docs/ci-pipeline.md)
as the shared reference. Repository scripts keep ownership of product tests and deployment policy.

## Verification

The workflow is `CI & Deploy`, with `Verify` followed by `Deploy`. Common Verify steps are:

1. Checkout the workflow commit
2. Setup pnpm
3. Setup Node.js
4. Install dependencies
5. Setup Go for verification
6. Install reviewed zt CLI
7. Record verification provenance
8. Install Chromium
9. Verify frontend and production Worker
10. Show failed native checks
11. Upload verified build
12. Upload frontend verification evidence

Actions are pinned to immutable source commits. Checkout uses the workflow SHA and disables
persisted credentials. Node 24, the native pnpm version and frozen lock remain required.
Go 1.27.1 installs reviewed zt source `3f9a3a7d33befc5a954ba1e86d3aa6d72e2c762f`
into the runner's temporary bin directory. No Go cache or new dependency-policy exception is added.
Provenance retains the actual checkout, lock SHA256, CLI version, compiled toolchain/module details
and Node/pnpm versions under `.zt/artifacts/`.

`pnpm check` runs the required `zt.json` profile in this order:

| Native gate | Command | Showcase coverage |
| --- | --- | --- |
| lint | `pnpm lint` | Strict typed/framework rules and zero warnings |
| css | `pnpm lint:css` | Syntax, semantic paint and declared token references |
| typecheck | `pnpm typecheck` | Strict application/UI and separate tooling projects |
| unit | `pnpm test` | Clock, preferences, policy and source provenance |
| build | `pnpm build` | Production Worker and client assets |
| e2e | `pnpm test:browser` | Chromium regressions and separate preference boundaries |
| a11y | `pnpm test:a11y` | Full Axe scans and actual Google Fonts checks |
| integration | `pnpm test:evidence` | Deliberate failure, retained evidence and stopped later gates |

The last gate validates an isolated expected failure; application failures stay failures.
It is no longer a separate workflow command. Required native failure stops later gates and records
them as `not_run`. The diagnostic step reads existing failed/blocked logs, without rerunning them
or clearing the failed status. It excludes the nested deliberate-failure reports.

Showcase retains one additional failure-only step after diagnostics: an independent production
build and real Google Fonts check when a native prerequisite fails. This provides font evidence
without bypassing that failure. The required ordinary English/Chinese cold and warm budgets and
multilingual glyph, weight, composed-emoji, CSP and request-count checks remain in the native suite.

Build artifacts use `worker-${github.sha}`. Evidence uses
`frontend-${github.run_id}-${github.run_attempt}` and uploads on success or failure. Both retain
seven days; missing required artifact files are errors. There are no production credentials in Verify.

## Deployment

Deploy requires successful Verify and a push to `main` in `zeithrold/showcase`. There is no manual
trigger, confirmation parameter or enabling switch. PR runs cannot deploy production.

The common deployment sequence is checkout, pnpm/Node setup, frozen dependencies, `Download the
tested Worker`, `Verify deployment boundaries`, `Deploy the tested Worker`, and `Verify production
deployment`. The boundary step checks the trigger/repository and required Worker/client files.
Deployment uses that run's downloaded artifact without rebuilding and tags it with the workflow SHA.
The existing account, Worker, Custom Domain, token scope and repository-only deployment guard remain local.

Post-deployment verification runs `pnpm verify:release` through the existing authenticated
Wrangler API, requiring a single active Worker version tagged with the exact SHA at 100% traffic.
The owner removed the public page and asset probes from GitHub Actions because Cloudflare
challenges those requests. Browser, accessibility and real Google Fonts checks remain required
against the production Worker locally before deployment.

The existing token is available only to deployment and production verification. Permissions,
secrets, infrastructure, main-run concurrency and production security settings are unchanged.
Project-specific commands do not become generic tools policy or another consumer's configuration.
