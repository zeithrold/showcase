import path from 'node:path'
import process from 'node:process'
import { defineConfig } from '@playwright/test'
import { verificationArtifacts } from '@ztd-me/frontend-checks/playwright'
import { mainPort, workerStart } from './tests/test-ports'

const testUrl = process.env.SHOWCASE_TEST_URL ?? ''

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
    baseURL: testUrl !== '' ? testUrl : `http://localhost:${mainPort}`,
    timezoneId: 'Asia/Shanghai',
  },
  webServer: testUrl !== ''
    ? undefined
    : {
        command: workerStart(mainPort),
        url: `http://localhost:${mainPort}`,
        reuseExistingServer: (process.env.CI ?? '') === '',
        timeout: 60000,
        env: { WRANGLER_LOG_PATH: '/tmp/showcase-wrangler-logs' },
      },
})
