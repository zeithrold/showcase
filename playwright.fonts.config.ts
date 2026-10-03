import path from 'node:path'
import process from 'node:process'
import { defineConfig } from '@playwright/test'
import { verificationArtifacts } from '@ztd-me/frontend-checks/playwright'

const artifacts = verificationArtifacts(path.join(process.env.ZT_ARTIFACTS_DIR ?? '.zt/browser', 'fonts'))

export default defineConfig({
  ...artifacts,
  testDir: './tests/fonts',
  workers: 1,
  retries: 0,
  use: {
    ...artifacts.use,
    baseURL: 'http://localhost:4173',
    timezoneId: 'Asia/Shanghai',
  },
  webServer: {
    command: 'pnpm start --port 4173',
    url: 'http://localhost:4173',
    timeout: 60000,
    reuseExistingServer: false,
  },
})
