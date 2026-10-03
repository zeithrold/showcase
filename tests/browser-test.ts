import { test as base } from '@playwright/test'
import { prepareFontPreview } from './font-preview'

export const test = base.extend({
  context: async ({ context }, run) => {
    await prepareFontPreview(context)
    await run(context)
  },
})
