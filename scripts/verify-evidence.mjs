import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { spawnSync } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const cli = fileURLToPath(import.meta.resolve('@playwright/test/cli'))
const playwright = import.meta.resolve('@playwright/test')
const helpers = import.meta.resolve('@ztd-me/frontend-checks/playwright')
const browserTest = fileURLToPath(new URL('../tests/browser-test.ts', import.meta.url))

async function createFixture(directory) {
  const config = path.join(directory, 'playwright.config.mjs')
  await writeFile(config, `
import { defineConfig } from ${JSON.stringify(playwright)}
import { verificationArtifacts } from ${JSON.stringify(helpers)}
export default defineConfig({
  ...verificationArtifacts(),
  testDir: ${JSON.stringify(directory)},
  workers: 1,
  use: { ...verificationArtifacts().use, baseURL: 'http://localhost:4173' },
  webServer: {
    command: 'pnpm start --port 4173', cwd: ${JSON.stringify(root)},
    url: 'http://localhost:4173', reuseExistingServer: false, timeout: 60000,
  },
})
`)
  await writeFile(path.join(directory, 'failure.spec.mjs'), `
import { test } from ${JSON.stringify(browserTest)}
import { assertAccessible, captureState } from ${JSON.stringify(helpers)}
test('intentional evidence probe', async ({ page }, testInfo) => {
  await page.goto('/clock')
  await page.evaluate(() => document.body.appendChild(document.createElement('button')))
  await captureState(page, testInfo, 'intentional-failure-state')
  await assertAccessible(page, testInfo, { label: 'intentional-failure' })
})
`)
  await writeFile(path.join(directory, 'zt.json'), JSON.stringify({
    schemaVersion: 1,
    modules: [
      {
        id: 'evidence',
        path: '.',
        stack: 'js-ts',
        profiles: { failure: ['a11y', 'unit'] },
        commands: {
          a11y: [
            process.execPath,
            cli,
            'test',
            '--config',
            config,
          ],
          unit: [
            process.execPath,
            '-e',
            'throw new Error("Later gate must not run")',
          ],
        },
      },
    ],
  }))
}

async function inspectFailure(report) {
  assert.equal(report.status, 'failed')
  assert.deepEqual(report.checks.map(check => check.status), ['failed', 'not_run'])
  assert.equal(report.checks[0].steps[0].exitCode, 1)
  const browser = JSON.parse(await readFile(path.join(report.artifactDir, 'playwright.json'), 'utf8'))
  assert.equal(browser.stats.unexpected, 1)
  const result = browser.suites[0].specs[0].tests[0].results[0]
  const scan = result.attachments.find(attachment => attachment.name === 'a11y-intentional-failure')
  assert.ok(scan)
  const data = scan.body ? Buffer.from(scan.body, 'base64') : await readFile(scan.path)
  const axe = JSON.parse(data.toString())
  assert.ok(axe.violations.some(violation => violation.id === 'button-name'))
  assert.ok(axe.passes.length > 0)
  for (const name of [
    'trace',
    'screenshot',
    'video',
    'intentional-failure-state',
  ]) {
    const attachment = result.attachments.find(item => item.name === name)
    assert.ok(attachment, `Missing ${name}`)
    assert.ok(attachment.body || (await readFile(attachment.path)).length > 0)
  }
  assert.ok((await readFile(path.join(report.artifactDir, 'playwright-report/index.html'))).length > 0)
  assert.ok(report.artifacts.some(artifact => artifact.endsWith('.zip')))
  assert.ok(report.artifacts.some(artifact => artifact.endsWith('.webm')))
}

async function main() {
  const directory = await mkdtemp(path.join(tmpdir(), 'showcase-evidence-'))
  try {
    await createFixture(directory)
    const result = spawnSync('zt', [
      'check',
      '--module',
      'evidence',
      '--profile',
      'failure',
      '--root',
      directory,
      '--artifacts',
      path.join(root, '.zt/artifacts/failure-probe'),
      '--json',
    ], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 })
    if (result.error !== undefined) {
      throw result.error
    }
    assert.equal(result.status, 1, result.stderr)
    assert.ok(result.stdout.trim(), result.stderr)
    const report = JSON.parse(result.stdout)
    await inspectFailure(report)
    process.stdout.write(`Expected failure evidence verified: ${report.artifactDir}\n`)
  }
  finally {
    await rm(directory, { recursive: true, force: true })
  }
}

await main()
