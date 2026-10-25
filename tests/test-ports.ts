// Local Worker origins for the browser suites. Every Playwright config and the
// synthetic preference origins read these, so one base port moves a whole gate
// without leaving a stale hardcoded origin behind. The suites of a gate run
// concurrently, so they must not share a port.
import process from 'node:process'

const basePort = Number(process.env.SHOWCASE_TEST_PORT ?? 4173)

/** Regression and accessibility scans against the development Worker. */
export const mainPort = basePort
/** Real Google Fonts checks. */
export const fontPort = Number(process.env.SHOWCASE_FONT_TEST_PORT ?? basePort + 1)
/** Production-environment Worker used by the preference boundary suite. */
export const productionPort = Number(process.env.SHOWCASE_PRODUCTION_TEST_PORT ?? basePort + 2)
/** Preview-environment Worker used by the preference boundary suite. */
export const previewPort = Number(process.env.SHOWCASE_PREVIEW_TEST_PORT ?? basePort + 3)

/**
 * Starts the built Worker for one suite. Each suite gets its own local persistence
 * directory: concurrent workerd instances cannot share a single SQLite state
 * database (SQLITE_BUSY) and would also collide with a running `pnpm dev`.
 */
export function workerStart(port: number): string {
  return `pnpm start --inspector-port 0 --port ${port} --persist-to .wrangler/test-${port}`
}
