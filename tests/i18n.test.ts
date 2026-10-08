import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createShowcaseI18n, showcaseTranslation } from '../lib/i18n.ts'
import { en } from '../lib/locales/en.ts'
import { zhCN } from '../lib/locales/zh-CN.ts'

test('Showcase initializes request-local instances and keeps their languages isolated', async () => {
  const english = createShowcaseI18n('en')
  const chinese = createShowcaseI18n('zh-CN')
  assert.equal(showcaseTranslation(english, 'en')('collection.title'), en['collection.title'])
  assert.ok(Object.is(showcaseTranslation(chinese, 'zh-CN')('collection.title'), zhCN['collection.title']))
  await english.changeLanguage('zh-CN')
  await chinese.changeLanguage('en')
  assert.equal(english.language, 'zh-CN')
  assert.equal(chinese.language, 'en')
}).catch((error: unknown) => { throw error })

test('typed plural keys and interpolated clock labels retain i18next behavior', () => {
  const instance = createShowcaseI18n('en')
  const translate = showcaseTranslation(instance, 'en')
  assert.equal(translate('pages.count', { count: 1 }), '1 page')
  assert.equal(translate('pages.count', { count: 2 }), '2 pages')
  assert.ok(translate('clock.label', { city: 'London', time: '10:30' }).includes('London'))
  instance.addResourceBundle('zh-CN', 'unrelated', { 'collection.title': 'Wrong namespace' })
  assert.ok(Object.is(translate('collection.title', {
    lng: 'zh-CN',
    lngs: ['zh-CN'],
    ns: 'unrelated',
  }), en['collection.title']))
  assert.equal(instance.language, 'en')
}).catch((error: unknown) => { throw error })
