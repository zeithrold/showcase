import path from 'node:path'
import process from 'node:process'
import { defineConfig } from '@playwright/test'
import { verificationArtifacts } from '@ztd-me/frontend-checks/playwright'

const artifacts = verificationArtifacts(path.join(
  process.env.ZT_ARTIFACTS_DIR ?? '.zt/browser',
  process.env.SHOWCASE_TEST_SUITE ?? 'all',
))

export default defineConfig({
  ...artifacts,
  testDir: './tests/e2e',
  fullyParallel: true,
  workers: (process.env.CI ?? '') !== '' ? 2 : undefined,
  retries: 0,
  use: {
    ...artifacts.use,
    baseURL: process.env.SHOWCASE_TEST_URL ?? 'http://localhost:4173',
    timezoneId: 'Asia/Shanghai',
  },
  webServer: (process.env.SHOWCASE_TEST_URL ?? '') !== ''
    ? undefined
    : {
        command: 'pnpm start --port 4173',
        url: 'http://localhost:4173',
        reuseExistingServer: (process.env.CI ?? '') === '',
        timeout: 60000,
        env: { WRANGLER_LOG_PATH: '/tmp/showcase-wrangler-logs' },
      },
})
