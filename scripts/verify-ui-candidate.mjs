import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

export function verifyCandidate(candidate, dependencies) {
  assert.equal(candidate.kind, 'reviewed-local-candidate')
  assert.equal(candidate.approvedPublicInstallation, false)
  assert.match(candidate.baseCommit, /^[a-f0-9]{40}$/u)
  assert.match(candidate.registryItemSha256, /^[a-f0-9]{64}$/u)
  assert.match(candidate.inventorySha256, /^[a-f0-9]{64}$/u)
  assert.equal(candidate.files.length, 76)
  const inventory = createHash('sha256').update(JSON.stringify(candidate.files)).digest('hex')
  assert.equal(inventory, candidate.inventorySha256, 'Candidate inventory changed without review')
  const expected = candidate.files.map(file => file.path).sort()
  assert.equal(new Set(expected).size, expected.length, 'Duplicate candidate source paths')
  for (const file of candidate.files) {
    assert.match(file.path, /^components\/ui\/ztd-me\/(?!.*\.\.)[\w@./-]+$/u)
    assert.match(file.sha256, /^[a-f0-9]{64}$/u)
    assert.match(file.upstreamSha256, /^[a-f0-9]{64}$/u)
    if (file.sha256 !== file.upstreamSha256) {
      assert.ok(typeof file.adaptation === 'string' && file.adaptation.trim().length > 0)
    }
    const actual = createHash('sha256').update(readFileSync(file.path)).digest('hex')
    assert.equal(actual, file.sha256, `Unreviewed candidate change: ${file.path}`)
  }
  assert.deepEqual(sourceFiles('components/ui/ztd-me').sort(), expected, 'Candidate must be installed atomically')
  for (const dependency of candidate.dependencies) {
    const separator = dependency.lastIndexOf('@')
    assert.ok(separator > 0, `Invalid candidate dependency pin: ${dependency}`)
    assert.equal(dependencies[dependency.slice(0, separator)], dependency.slice(separator + 1))
  }
}

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const name = path.join(directory, entry.name)
    return entry.isDirectory() ? sourceFiles(name) : [name]
  })
}
