import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import source from '../ui-source.lock.json' with { type: 'json' }

test('reviewed UI source, local adaptations and licenses match the pinned public inventory', async () => {
  assert.equal(source.sourceSha, '7c708c0e0672a302cd751550276fb7a7a43cf1e5')
  assert.equal(source.publicInstallationVerified, true)
  assert.equal(Object.keys(source.files).length, 42)
  const expected = new Map(Object.entries(source.files))
  for (const [file, adaptation] of Object.entries(source.localAdaptations)) {
    expected.set(file, adaptation.sha256)
  }
  assert.equal(expected.size, 42)
  for (const [file, upstream] of Object.entries(source.files)) {
    const actual = createHash('sha256').update(await readFile(file)).digest('hex')
    assert.ok(actual === expected.get(file), `${file} (upstream: ${upstream})`)
  }
}).catch((error: unknown) => { throw error })
