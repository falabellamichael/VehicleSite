import { defineConfig } from "@playwright/test";
const remote = process.env.PAGES_URL;
export default defineConfig({
  testDir: "./deployment-tests",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 30000,
  reporter: "list",
  use: {
    baseURL: remote || "http://127.0.0.1:4189/VehicleSite/",
    channel: process.env.PW_CHANNEL || undefined,
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: remote
    ? undefined
    : {
        command: "node scripts/serve-pages.mjs",
        url: "http://127.0.0.1:4189/VehicleSite/",
        reuseExistingServer: false,
        timeout: 15000,
      },
});
