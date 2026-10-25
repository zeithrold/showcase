import path from 'node:path'
import process from 'node:process'
import { defineConfig } from '@playwright/test'
import { verificationArtifacts } from '@ztd-me/frontend-checks/playwright'
import { previewPort, productionPort, workerStart } from './tests/test-ports'

const artifacts = verificationArtifacts(path.join(process.env.ZT_ARTIFACTS_DIR ?? '.zt/browser', 'boundaries'))

function server(environment: 'production' | 'preview', port: number): {
  command: string
  url: string
  timeout: number
  reuseExistingServer: boolean
} {
  return {
    command: `${workerStart(port)} --var SHOWCASE_FRONTEND_ENVIRONMENT:${environment}`,
    url: `http://localhost:${port}`,
    timeout: 60000,
    reuseExistingServer: false,
  }
}

export default defineConfig({
  ...artifacts,
  testDir: './tests/browser-preferences',
  workers: 1,
  retries: 0,
  use: { ...artifacts.use, timezoneId: 'Asia/Shanghai' },
  webServer: [
    server('production', productionPort),
    server('preview', previewPort),
  ],
})
