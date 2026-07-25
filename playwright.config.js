/**
 * Configuration Playwright — tests d'intégration.
 * Lance le serveur de dev Next.js puis exécute les scénarios de e2e/.
 */
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:3210',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npx next dev -p 3210',
    url: 'http://localhost:3210',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
