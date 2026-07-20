import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  timeout: 30 * 1000,
  retries: 0,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    actionTimeout: 10 * 1000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1280, height: 800 },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  webServer: {
    command: 'npx http-server . -p 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 30 * 1000,
  },
});
