import { defineConfig } from "@playwright/test";

const PORT = 4319;

/**
 * End-to-end against the production build served with vercel.json's headers
 * (scripts/serve-prod.ts), with Claude replaced by the recorded fixtures.
 * WebGL runs on SwiftShader in headless Chromium.
 */
export default defineConfig({
  testDir: "e2e",
  timeout: 120_000,
  expect: { timeout: 30_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 1440, height: 900 },
    colorScheme: "light",
    launchOptions: {
      executablePath: process.env.CHROMIUM_PATH || undefined,
      args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
    },
  },
  webServer: {
    command: `rm -rf .data-e2e && npm run build && tsx scripts/serve-prod.ts`,
    url: `http://localhost:${PORT}/api/session`,
    timeout: 180_000,
    reuseExistingServer: false,
    env: {
      PORT: String(PORT),
      ANTHROPIC_MOCK: "fixtures",
      MOCK_DELAY_MS: "6",
      APP_PASSWORD: "e2e-password",
      DATA_DIR: ".data-e2e",
      DAILY_BUDGET_USD: "20",
    },
  },
});
