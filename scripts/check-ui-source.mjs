import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { verifyCandidate } from './verify-ui-candidate.mjs'

const lock = JSON.parse(readFileSync('ui-source.lock.json', 'utf8'))
const manifest = JSON.parse(readFileSync('package.json', 'utf8'))
const config = JSON.parse(readFileSync('components.json', 'utf8'))
assert.equal(config.registries['@ztd-me'], `https://raw.githubusercontent.com/zeithrold/tools/${lock.sourceSha}/registry/{name}.json`)
if (lock.candidate !== undefined) {
  assert.equal(lock.installedDelivery, 'reviewed-local-candidate')
  verifyCandidate(lock.candidate, manifest.dependencies)
}
else {
  assert.equal(Object.keys(lock.files).length, 42)
  for (const [file, hash] of Object.entries(lock.files)) {
    const expected = lock.localAdaptations[file]?.sha256 ?? hash
    assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'), expected)
  }
}
console.log('Verified the complete installed UI source inventory.')
