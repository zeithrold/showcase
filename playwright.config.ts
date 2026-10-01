import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  workers: process.env.CI ? 2 : undefined,
  retries: 0,
  reporter: "list",
  use: { baseURL: process.env.SHOWCASE_TEST_URL ?? "http://localhost:4173", timezoneId: "Asia/Shanghai", trace: "retain-on-failure" },
  webServer: process.env.SHOWCASE_TEST_URL ? undefined : {
    command: "pnpm start --port 4173",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
    env: { WRANGLER_LOG_PATH: "/tmp/showcase-wrangler-logs" },
  },
});
