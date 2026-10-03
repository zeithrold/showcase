# Source-owned UI integration

Showcase installs editable `@ztd-me/ui` from approved tools source
`7c708c0e0672a302cd751550276fb7a7a43cf1e5` through the public registry and real
`shadcn@4.21.1` CLI. `components.json` pins that full SHA; `ui-source.lock.json` records the
public payload digest, 42 installed file digests, required dependency pins and reviewed local adaptation.
No `@ztd-me/frontend` runtime package, Fontsource dependency or font binary remains.

The fresh public installation matched all 42 approved payload files before adaptation, without
replacing existing consumer files. Local adaptations change the README's plain JSX example fence
from TSX to JSX, order its imports for project-aware Markdown lint, and use the Google API's variable
weight range to avoid repeating identical font declarations. All TypeScript runtime source, other
styles, licenses and the delivered declaration patch retain their upstream bytes. Keep the MIT,
shadcn MIT and six Noto OFL notices delivered under `components/ui/ztd-me/`.

## Ownership and preserved behavior

The installed source owns generic shell/provider, compact appbar, six palettes, appearance/locale
controls, semantic tokens and menu motion. Showcase owns branding, footer links/contact, routing,
About dialog, business navigation, its clock, translations and deployment/persistence policy.
No project-name allowlist, hostname inference, authentication policy or legacy mapping is added.

Both routes and clock APIs/settings remain intact. UI preferences preserve the current version-1
cookie names and format; business timezone/format/seconds remain origin-local under
`showcase.clock.settings.v1`. Initialization performs no persistence writes. Old/private records
are neither read, converted, deleted nor rewritten. Defaults remain Neutral + System. English and
Simplified Chinese, including the existing Chinese browser-language fallback, SSR metadata and
appearance before JavaScript, continue through the same consumer adapters.

Production explicitly configures `ztd.frontend.v1`, Domain=ztd.me and Secure. Preview and development
configure separate host-only names; only HTTP development omits Secure. Mirror keys are explicit
notification writes and are never read to restore state. The shared cookie is untrusted UI input,
not authorization. Focus/visibility refresh sharing; preview/development stay isolated. Business and
private records remain local. Cookie/storage failures retain usable in-memory controls and recovery.

## Typography, chrome and icons

Ordinary UI and clock typography use Noto Sans through the direct Google Fonts CSS2 API, with Noto
Sans SC/JP/KR for English and CJK coverage, weights 400/500/600/700 and no synthesized weights.
Noto Color Emoji handles intentional emoji, including composed sequences. Serif families are not
loaded because this consumer has no serif content role. `styles/fonts.css` owns the request and tokens;
read the delivered `fonts.md` for the upstream query, licensing and remote-font mutability.

The installed font request locally uses `wght@400..700` for each Sans family, retaining every required
weight. The initial exact upstream request repeated the same variable font URLs in four weight blocks;
actual CI measured 1,084,594 bytes on the Chinese clock, exceeding its 1,000,000-byte cap. Google's
[variable-axis API](https://developers.google.com/fonts/docs/css2#axis_ranges) returns the same 368
unique font URLs with one block per subset instead of four. A normal-TLS Chrome-user-agent probe
reduced decoded API CSS from 1,304,025 to 333,750 bytes without changing any font URL, family, glyph
coverage, application font weight or security origin. This reviewed adaptation is recorded separately
from upstream hashes. Remote CI still enforces the original combined response caps.

The browser contacts fonts.googleapis.com for CSS and fonts.gstatic.com for subsets. These services
receive normal request information such as IP address and headers; the source SHA does not make
remote responses immutable. No private/dynamic text is put into font API queries. Native fallback
keeps text readable during outages, but fallback alone does not verify intended Noto rendering.

Repository configuration and observed production headers/HTML on 2026-10-03 contain no CSP policy;
this change adds or relaxes no CSP, script/nonce policy, security setting or production origin grant.
A future restrictive policy needs fonts.googleapis.com in style-src-elem (or style-src) and
fonts.gstatic.com in font-src, subject to the consumer's own security approval.

The appbar keeps 44px targets while its visible hover surface is compact. Shared borders are soft;
menus enter/exit with short directional motion and become noninteractive on exit. Reduced motion
removes these menu animations and retains the existing clock fallback. Existing narrow navigation
and fullscreen portal ownership remain local.

Action/navigation/status iconography uses Lucide. The former decorative star and motion arrow now
use Lucide Asterisk/ArrowUp, with explicit aria-hidden. Existing brand artwork and time-bearing mini
dials remain intentional consumer content; copyright and translated prose are preserved.

## Strict verification and dependency compatibility

Use Node 24, pnpm 11.22.0, Playwright 1.62.0 Chromium and the existing pinned zt CLI.

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm test:evidence
```

The recipe's Select 2.3.7 patch changes only its `.d.ts` and `.d.mts` Popper inheritance; no JavaScript
is patched. It is recorded in the native pnpm lock with strict application/UI library checking.
Original age, no-downgrade, exact semver trust exception and esbuild/workerd build policies remain.
Only UI-required direct pins change; unrelated registry package versions are preserved.

Unit tests compile source imports with native TypeScript into ignored `.zt/unit`, then use Node's
native test runner. Source provenance/notice checks supplement policy, clock and persistence tests.
CSS checks include all installed CSS and exactly the three runtime variables supplied by Radix
Popper/Select, following the source recipe. Typed/framework lint and limits remain strict.

The required native profile covers lint, CSS, types, units, production Worker build, browser/storage
regressions and Axe. Menu focus/motion tests cover the approved chrome, ordinary pages retain all
existing flows, and fonts add actual platform-glyph, weight, composed-emoji, CSP and request evidence.
English cold responses must total at most 500,000 bytes, Chinese cold 1,000,000 bytes, and immediate
warm reloads 10,000 bytes, including API CSS and font responses. Fresh contexts isolate cold runs;
warm runs keep default cache behavior. The full multilingual specimen reports transfers without an
ordinary-page cap, while retaining fewer than 80 font requests, exact glyph/weight and full-page Axe.
Encoded HTTP response bytes and decoded body sizes are reported separately. Warm decoded bodies
refer to prior cold data, not new traffic. No test skip or TLS bypass satisfies the remote-font gate.

Cloud Chromium's Google certificate validation fails in this environment. The explicitly enabled
`SHOWCASE_LOCAL_FONT_PREVIEW=1` test harness fetches official Google bytes with normal TLS and
intercepts only font origins for local interaction/glyph review. Cache files are ignored, no application
font URL changes, and CI rejects preview mode. Such preview does not verify actual remote delivery or
budgets; normal GitHub CI must run real Google requests with all budgets enforced. A failed native
prerequisite also runs the font gate independently, retaining its evidence without clearing that failure.

Reports, scans, font profiles, screenshots, traces and videos belong in ignored `.zt/artifacts/` and
CI artifacts, not Git source. The build-tool declaration reproducer is retained there separately.
The original Cloudflare Vite plugin/Wrangler/Miniflare declaration graph references missing private
modules and `miniflare/dist/src/shared`; whole-repository `skipLibCheck: false` fails on those published
build-tool declarations. The required type gate now runs both projects: `tsconfig.json` checks all
application/UI/test declarations with `skipLibCheck: false`; `tsconfig.tooling.json` checks
`vite.config.ts` with strict/noUncheckedIndexedAccess and preserves the original `skipLibCheck: true`
only for its broken build-tool dependency declarations. The separate lint project includes every
handwritten TypeScript file, including that tooling file. No stub declarations, runtime patch or
global library-check relaxation is used. Revisit the narrow compatibility setting when the upstream
packages publish complete declarations.

## Reviewed updates and deployment

Change the registry SHA only after owner approval and a fresh public source gate. Use shadcn dry-run
and stage incoming source in a disposable checkout; review against `ui-source.lock.json`, preserve
local adaptations, update provenance/locks deliberately, and repeat all native and browser gates.
There is no automatic overwrite, new synchronization service or registry-owned consumer policy.

Main-only deployment protection and production resources are unchanged. PR checks use local built
Workers, with synthetic intercepted HTTPS origins for sharing/isolation. This migration includes no
merge or manual deployment. Chromium evidence does not claim live cross-site traffic, other browser
engines, assistive-technology certification or maintained visual baselines. Owner visual/interaction
review remains part of the draft PR.
