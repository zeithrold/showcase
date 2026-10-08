import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { test } from 'node:test'
import { pathToFileURL } from 'node:url'
import source from '../ui-source.lock.json' with { type: 'json' }

const validator = pathToFileURL(resolve('scripts/verify-ui-candidate.mjs')).href

function verify(root: string, candidate = source.candidate): void {
  writeFileSync(join(root, 'candidate.json'), JSON.stringify(candidate))
  const script = `import {readFileSync} from 'node:fs'; import {verifyCandidate} from ${JSON.stringify(validator)};
    verifyCandidate(JSON.parse(readFileSync('candidate.json','utf8')),
      JSON.parse(readFileSync('package.json','utf8')).dependencies)`
  execFileSync(process.execPath, [
    '--input-type=module',
    '--eval',
    script,
  ], { cwd: root, stdio: 'pipe' })
}

function fixture(): string {
  const root = mkdtempSync(join(tmpdir(), 'showcase-ui-receipt-'))
  for (const file of source.candidate.files) {
    const target = join(root, file.path)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, readFileSync(file.path))
  }
  writeFileSync(join(root, 'package.json'), readFileSync('package.json'))
  return root
}

test('retains the public pin and verifies current bytes as a complete local candidate', () => {
  assert.equal(source.sourceSha, '7c708c0e0672a302cd751550276fb7a7a43cf1e5')
  assert.equal(source.publicInstallationVerified, true)
  assert.equal(Object.keys(source.files).length, 42)
  assert.equal(source.candidate.files.length, 76)
  assert.equal(source.candidate.approvedPublicInstallation, false)
  const root = fixture()
  try {
    verify(root)
  }
  finally {
    rmSync(root, { recursive: true, force: true })
  }
}).catch((error: unknown) => { throw error })

test('rejects unrecorded candidate bytes and additional installed files', () => {
  const root = fixture()
  try {
    writeFileSync(join(root, 'components/ui/ztd-me/client.ts'), 'export {}\n')
    assert.throws(() => verify(root), /Unreviewed candidate change/u)
    writeFileSync(join(root, 'components/ui/ztd-me/client.ts'), readFileSync('components/ui/ztd-me/client.ts'))
    writeFileSync(join(root, 'components/ui/ztd-me/unreviewed.txt'), 'Unreviewed source\n')
    assert.throws(() => verify(root), /Candidate must be installed atomically/u)
  }
  finally {
    rmSync(root, { recursive: true, force: true })
  }
}).catch((error: unknown) => { throw error })

test('rejects a modified inventory digest and any claim of public installation approval', () => {
  const root = fixture()
  const candidate = structuredClone(source.candidate)
  try {
    candidate.inventorySha256 = '0'.repeat(64)
    assert.throws(() => verify(root, candidate), /Candidate inventory changed without review/u)
    candidate.inventorySha256 = source.candidate.inventorySha256
    candidate.approvedPublicInstallation = true
    assert.throws(() => verify(root, candidate))
  }
  finally {
    rmSync(root, { recursive: true, force: true })
  }
}).catch((error: unknown) => { throw error })
