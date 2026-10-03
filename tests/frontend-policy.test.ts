import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readPreferenceCookie } from '@ztd-me/frontend'
import { showcasePreferencePolicy } from '../lib/frontend-policy.ts'

test('production keeps the current shared cookie and notification key with explicit secure domain', () => {
  const policy = showcasePreferencePolicy('production')
  assert.deepEqual(policy, {
    name: 'ztd.frontend.v1',
    domain: 'ztd.me',
    secure: true,
    mirrorKey: 'ztd.frontend.v1',
  })
  const value = { version: 1, mode: 'dark', palette: 'ocean', locale: 'zh-CN' }
  const cookie = `ztd.frontend.v1=${encodeURIComponent(JSON.stringify(value))}`
  assert.deepEqual(readPreferenceCookie(cookie, policy).preferences, value)
}).catch((error: unknown) => { throw error })

test('preview and development policies stay host-only with independent current cookie names', () => {
  for (const environment of ['preview', 'development'] as const) {
    const policy = showcasePreferencePolicy(environment)
    assert.ok(!Object.hasOwn(policy, 'domain'))
    assert.ok(policy.name === `ztd.frontend.${environment}.showcase.v1`)
    assert.equal(policy.mirrorKey, policy.name)
    const expected: unknown = environment === 'preview'
    assert.equal(policy.secure, expected)
  }
}).catch((error: unknown) => { throw error })

test('isolated policies do not accept production values or unrelated locale cookies', () => {
  const cookie = `ztd.frontend.v1=${encodeURIComponent(JSON.stringify({ version: 1, locale: 'zh-CN' }))}; locale=zh-CN`
  assert.equal(readPreferenceCookie(cookie, showcasePreferencePolicy('preview')).status, 'missing')
  assert.equal(readPreferenceCookie(cookie, showcasePreferencePolicy('development')).status, 'missing')
}).catch((error: unknown) => { throw error })
