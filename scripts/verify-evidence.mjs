import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { spawnSync } from 'node:child_process'
import { mkdtemp, readFile, realpath, rm, stat, writeFile } from 'node:fs/promises'
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
    command: 'pnpm start --port 4173 --persist-to .wrangler/test-evidence', cwd: ${JSON.stringify(root)},
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

const PNG_SIGNATURE = Buffer.from([
  0x89,
  0x50,
  0x4E,
  0x47,
  0x0D,
  0x0A,
  0x1A,
  0x0A,
])
const PNG_TRAILER = Buffer.from([
  0x49,
  0x45,
  0x4E,
  0x44,
  0xAE,
  0x42,
  0x60,
  0x82,
])
const ZIP_SIGNATURE = Buffer.from([
  0x50,
  0x4B,
  0x03,
  0x04,
])
const WEBM_SIGNATURE = Buffer.from([
  0x1A,
  0x45,
  0xDF,
  0xA3,
])

// Attachments arrive either inlined as base64 (published 0.1.3 helpers) or as a full
// file path (helper releases that attach complete files and clean their own source).
// Both shapes are read here; neither may satisfy the check with an empty value.
async function attachmentBytes(attachment, runRoot) {
  if (typeof attachment.body === 'string' && attachment.body !== '') {
    return Buffer.from(attachment.body, 'base64')
  }
  if (typeof attachment.path !== 'string' || attachment.path === '') {
    throw new Error(`Attachment ${attachment.name} has neither an inlined body nor a file path`)
  }
  // One resolution rule: an absolute path is used exactly as reported and a relative
  // path is resolved from this run's artifact root. A missing absolute path never
  // falls back to a same-named file, `..` and an earlier run stay out of reach, and
  // a symlink is rejected when its target leaves this run's artifacts.
  const selected = path.isAbsolute(attachment.path)
    ? attachment.path
    : path.resolve(runRoot, attachment.path)
  let real
  try {
    real = await realpath(selected)
  }
  catch (error) {
    throw new Error(`Attachment ${attachment.name} is missing its file: ${selected}`, { cause: error })
  }
  const relative = path.relative(runRoot, real)
  assert.ok(
    relative !== '' && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative),
    `Attachment ${attachment.name} resolves outside this run's artifacts: ${real}`,
  )
  assert.ok(
    (await stat(real)).isFile(),
    `Attachment ${attachment.name} is not a regular file: ${real}`,
  )
  return await readFile(real)
}

// Both shapes must carry a complete Axe payload: the engine record and all four
// result sections, not only a violations list.
function assertAxePayload(attachment, bytes) {
  const axe = JSON.parse(bytes.toString())
  assert.ok(
    axe !== null && typeof axe === 'object' && !Array.isArray(axe),
    `Attachment ${attachment.name} is not an Axe result object`,
  )
  const engine = axe.testEngine
  assert.ok(engine !== null && typeof engine === 'object', `Attachment ${attachment.name} has no Axe engine record`)
  assert.ok(
    typeof engine.name === 'string' && engine.name !== '',
    `Attachment ${attachment.name} has no Axe engine name`,
  )
  assert.ok(
    typeof engine.version === 'string' && /^\d+\.\d+\.\d+/u.test(engine.version),
    `Attachment ${attachment.name} has no Axe engine version`,
  )
  for (const section of [
    'violations',
    'passes',
    'incomplete',
    'inapplicable',
  ]) {
    assert.ok(Array.isArray(axe[section]), `Attachment ${attachment.name} has no Axe ${section} array`)
  }
  return axe
}

// Retention is only meaningful for complete artifacts, so the expected container is
// checked rather than just the byte count.
function assertComplete(attachment, bytes) {
  assert.ok(bytes.length > 0, `Attachment ${attachment.name} is empty`)
  const leading = signature => bytes.subarray(0, signature.length).equals(signature)
  switch (attachment.contentType) {
    case 'image/png':
      assert.ok(leading(PNG_SIGNATURE), `Attachment ${attachment.name} is not a PNG image`)
      assert.ok(
        bytes.subarray(-PNG_TRAILER.length).equals(PNG_TRAILER),
        `Attachment ${attachment.name} is a truncated PNG image`,
      )
      break
    case 'application/zip':
      assert.ok(leading(ZIP_SIGNATURE), `Attachment ${attachment.name} is not a zip archive`)
      break
    case 'video/webm':
      assert.ok(leading(WEBM_SIGNATURE), `Attachment ${attachment.name} is not a webm video`)
      break
    default:
      break
  }
}

async function inspectFailure(report) {
  assert.equal(report.status, 'failed')
  assert.deepEqual(report.checks.map(check => check.status), ['failed', 'not_run'])
  assert.equal(report.checks[0].steps[0].exitCode, 1)
  const runRoot = await realpath(report.artifactDir)
  const browser = JSON.parse(await readFile(path.join(runRoot, 'playwright.json'), 'utf8'))
  assert.equal(browser.stats.unexpected, 1)
  const spec = browser.suites[0].specs[0]
  assert.equal(spec.title, 'intentional evidence probe')
  assert.equal(spec.ok, false)
  // The evidence must belong to the one failed attempt, not to another case or retry.
  const attempts = spec.tests.flatMap(test => test.results ?? [])
  assert.equal(attempts.length, 1, 'The deliberate failure must have exactly one attempt')
  const [result] = attempts
  assert.equal(result.status, 'failed')
  assert.ok(Array.isArray(result.errors) && result.errors.length > 0, 'The failed attempt must record its error')
  assert.ok(
    String(result.errors[0]?.message ?? '').includes('button-name'),
    'The failed attempt must be the accessibility assertion that reported the unnamed button',
  )
  const scan = result.attachments.find(attachment => attachment.name === 'a11y-intentional-failure')
  assert.ok(scan)
  const axe = assertAxePayload(scan, await attachmentBytes(scan, runRoot))
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
    assertComplete(attachment, await attachmentBytes(attachment, runRoot))
  }
  assert.ok((await readFile(path.join(runRoot, 'playwright-report/index.html'))).length > 0)
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
