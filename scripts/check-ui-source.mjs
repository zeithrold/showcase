import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { verifyInstallation } from './verify-ui-installation.mjs'

const lock = JSON.parse(readFileSync('ui-source.lock.json', 'utf8'))
const manifest = JSON.parse(readFileSync('package.json', 'utf8'))
const config = JSON.parse(readFileSync('components.json', 'utf8'))
assert.equal(config.registries['@ztd-me'], `https://raw.githubusercontent.com/zeithrold/tools/${lock.sourceSha}/registry/{name}.json`)
assert.equal(lock.installedDelivery, 'verified-public-source')
assert.equal(lock.installation.sourceSha, lock.sourceSha)
assert.equal(lock.installation.registryItemSha256, lock.payloadSHA256)
assert.deepEqual(lock.files, Object.fromEntries(lock.installation.files.map(file => [file.path, file.upstreamSha256])))
verifyInstallation(lock.installation, manifest.dependencies)
console.log('Verified the complete installed public UI source inventory.')
