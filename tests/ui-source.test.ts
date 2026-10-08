import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { test } from 'node:test'
import { pathToFileURL } from 'node:url'
import source from '../ui-source.lock.json' with { type: 'json' }

const validator = pathToFileURL(resolve('scripts/verify-ui-installation.mjs')).href

function verify(root: string, installation = source.installation): void {
  writeFileSync(join(root, 'installation.json'), JSON.stringify(installation))
  const script = `import {readFileSync} from 'node:fs'; import {verifyInstallation} from ${JSON.stringify(validator)};
    verifyInstallation(JSON.parse(readFileSync('installation.json','utf8')),
      JSON.parse(readFileSync('package.json','utf8')).dependencies)`
  execFileSync(process.execPath, [
    '--input-type=module',
    '--eval',
    script,
  ], { cwd: root, stdio: 'pipe' })
}

function fixture(): string {
  const root = mkdtempSync(join(tmpdir(), 'showcase-ui-receipt-'))
  for (const file of source.installation.files) {
    const target = join(root, file.path)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, readFileSync(file.path))
  }
  writeFileSync(join(root, 'package.json'), readFileSync('package.json'))
  mkdirSync(join(root, 'docs'), { recursive: true })
  writeFileSync(join(root, 'docs/ui-public-installation.json'), readFileSync('docs/ui-public-installation.json'))
  return root
}

test('verifies the complete installed public source against the accepted CI receipt', () => {
  assert.equal(source.sourceSha, '9abea5a57b97f63109fb7dc5255543b53629c3ba')
  assert.equal(source.publicInstallationVerified, true)
  assert.equal(Object.keys(source.files).length, 77)
  assert.equal(source.installation.files.length, 77)
  assert.equal(source.installation.publicInstallationVerified, true)
  const root = fixture()
  try {
    verify(root)
  }
  finally {
    rmSync(root, { recursive: true, force: true })
  }
}).catch((error: unknown) => { throw error })

test('rejects unrecorded installation bytes and additional installed files', () => {
  const root = fixture()
  try {
    writeFileSync(join(root, 'components/ui/ztd-me/client.ts'), 'export {}\n')
    assert.throws(() => verify(root), /Unreviewed public source change/u)
    writeFileSync(join(root, 'components/ui/ztd-me/client.ts'), readFileSync('components/ui/ztd-me/client.ts'))
    writeFileSync(join(root, 'components/ui/ztd-me/unreviewed.txt'), 'Unreviewed source\n')
    assert.throws(() => verify(root), /Public source must be installed atomically/u)
  }
  finally {
    rmSync(root, { recursive: true, force: true })
  }
}).catch((error: unknown) => { throw error })

test('rejects a modified inventory digest or unverified public installation', () => {
  const root = fixture()
  const installation = structuredClone(source.installation)
  try {
    installation.inventorySha256 = '0'.repeat(64)
    assert.throws(() => verify(root, installation), /Public inventory changed without review/u)
    installation.inventorySha256 = source.installation.inventorySha256
    installation.publicInstallationVerified = false
    assert.throws(() => verify(root, installation))
  }
  finally {
    rmSync(root, { recursive: true, force: true })
  }
}).catch((error: unknown) => { throw error })
