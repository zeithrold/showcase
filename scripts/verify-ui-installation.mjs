import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

export function verifyInstallation(installation, dependencies) {
  assert.equal(installation.kind, 'verified-public-source')
  assert.equal(installation.publicInstallationVerified, true)
  assert.match(installation.sourceSha, /^[a-f0-9]{40}$/u)
  assert.match(installation.registryItemSha256, /^[a-f0-9]{64}$/u)
  assert.match(installation.inventorySha256, /^[a-f0-9]{64}$/u)
  assert.equal(installation.files.length, 77)
  const inventory = createHash('sha256').update(JSON.stringify(installation.files)).digest('hex')
  assert.equal(inventory, installation.inventorySha256, 'Public inventory changed without review')
  const proof = installation.verification
  assert.match(proof.ciUrl, /^https:\/\/github\.com\/zeithrold\/tools\/actions\/runs\/\d+$/u)
  assert.equal(proof.artifactName, `public-ui-source-${installation.sourceSha}`)
  assert.equal(proof.receiptPath, 'docs/ui-public-installation.json')
  const bytes = readFileSync(proof.receiptPath)
  assert.equal(createHash('sha256').update(bytes).digest('hex'), proof.receiptSha256, 'Public CI receipt changed')
  const receipt = JSON.parse(bytes)
  assert.equal(receipt.sourceSha, installation.sourceSha)
  assert.equal(receipt.payloadSha256, installation.registryItemSha256)
  assert.equal(receipt.publicInstallationVerified, true)
  assert.equal(receipt.fontVerification, 'google-fonts-api')
  assert.equal(receipt.cssVerification, 'published-checker')
  assert.equal(receipt.requiredUiPackage, false)
  assert.equal(receipt.cli, 'shadcn@4.21.1')
  assert.equal(receipt.registryUrl, `https://raw.githubusercontent.com/zeithrold/tools/${installation.sourceSha}/registry/{name}.json`)
  assert.deepEqual(receipt.dependencies, installation.dependencies)
  const upstream = installation.files.map(file => ({ installed: file.path, sha256: file.upstreamSha256 }))
  assert.deepEqual(receipt.files, upstream)
  const expected = installation.files.map(file => file.path).sort()
  assert.equal(new Set(expected).size, expected.length, 'Duplicate public source paths')
  for (const file of installation.files) {
    assert.match(file.path, /^components\/ui\/ztd-me\/(?!.*\.\.)[\w@./-]+$/u)
    assert.match(file.sha256, /^[a-f0-9]{64}$/u)
    assert.match(file.upstreamSha256, /^[a-f0-9]{64}$/u)
    if (file.sha256 !== file.upstreamSha256) {
      assert.ok(typeof file.adaptation === 'string' && file.adaptation.trim().length > 0)
    }
    const actual = createHash('sha256').update(readFileSync(file.path)).digest('hex')
    assert.equal(actual, file.sha256, `Unreviewed public source change: ${file.path}`)
  }
  assert.deepEqual(sourceFiles('components/ui/ztd-me').sort(), expected, 'Public source must be installed atomically')
  for (const dependency of installation.dependencies) {
    const separator = dependency.lastIndexOf('@')
    assert.ok(separator > 0, `Invalid public dependency pin: ${dependency}`)
    assert.equal(dependencies[dependency.slice(0, separator)], dependency.slice(separator + 1))
  }
}

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const name = path.join(directory, entry.name)
    return entry.isDirectory() ? sourceFiles(name) : [name]
  })
}
