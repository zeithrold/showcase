import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const baseURL = new URL(process.env.SHOWCASE_TEST_URL ?? 'https://showcase.ztd.me')
assert(['https:', 'http:'].includes(baseURL.protocol), 'Expected an HTTP(S) deployment URL')

async function fetchResource(route) {
  const url = new URL(route, baseURL)
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) })
  assert.equal(response.status, 200, `${url}: HTTP ${response.status}`)
  assert.equal(new URL(response.url).origin, baseURL.origin, `${url}: unexpected redirect`)
  assert.notEqual(response.headers.get('cf-mitigated'), 'challenge', `${url}: Cloudflare challenge`)
  return response
}

for (const [route, marker] of [
  [
    '/',
    /<section\b[^>]+\bid="pages"/,
  ],
  [
    '/clock',
    /<section\b[^>]+\bid="clock"/,
  ],
]) {
  const response = await fetchResource(route)
  assert.match(response.headers.get('content-type') ?? '', /^text\/html\b/, `${route}: expected HTML`)
  const html = await response.text()
  assert.match(html, /<title>zeithrold\/showcase<\/title>/, `${route}: unexpected site title`)
  assert.match(html, marker, `${route}: expected page content is missing`)
  if (route === '/') {
    assert.match(html, /<a\b[^>]+\bhref="\/clock"/, 'Homepage clock link is missing')
  }
  console.log(`Verified page ${route}`)
}

const assetsDirectory = path.resolve('dist/client')
const assets = (await readdir(assetsDirectory, { recursive: true, withFileTypes: true }))
  .filter(entry => entry.isFile())
  .map(entry => path.relative(assetsDirectory, path.join(entry.parentPath, entry.name)))
  .filter(file => !file.split(path.sep).some(segment => segment.startsWith('.')))
  .filter(file => /\.(?:js|css|woff2|svg|json)$/.test(file))
assert(assets.length > 0, 'No built assets found; run pnpm build before verification')
const digest = content => createHash('sha256').update(content).digest('hex')

// Check every public bundle, manifest, stylesheet, font and icon against the
// exact build being deployed, including assets loaded only after navigation.
let index = 0
await Promise.all(Array.from({ length: Math.min(4, assets.length) }, async () => {
  while (index < assets.length) {
    const file = assets[index++]
    const route = `/${file.split(path.sep).map(encodeURIComponent).join('/')}`
    const response = await fetchResource(route)
    const expected = await readFile(path.join(assetsDirectory, file))
    const actual = Buffer.from(await response.arrayBuffer())
    assert.equal(digest(actual), digest(expected), `${route}: deployed asset differs from this build`)
    console.log(`Verified asset ${route}`)
  }
}))
console.log(`Deployment verified: 2 pages and ${assets.length} assets match this build.`)
