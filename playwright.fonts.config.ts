import path from 'node:path'
import process from 'node:process'
import { defineConfig } from '@playwright/test'
import { verificationArtifacts } from '@ztd-me/frontend-checks/playwright'
import { fontPort, workerStart } from './tests/test-ports'

const fontOrigin = `http://localhost:${fontPort}`

const artifacts = verificationArtifacts(path.join(process.env.ZT_ARTIFACTS_DIR ?? '.zt/browser', 'fonts'))

export default defineConfig({
  ...artifacts,
  testDir: './tests/fonts',
  workers: 1,
  retries: 0,
  use: {
    ...artifacts.use,
    baseURL: fontOrigin,
    timezoneId: 'Asia/Shanghai',
  },
  webServer: {
    command: workerStart(fontPort),
    url: fontOrigin,
    timeout: 60000,
    reuseExistingServer: false,
  },
})
