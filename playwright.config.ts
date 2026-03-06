import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration
 * Comprehensive E2E test configuration with mobile support
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
const parsedBaseUrl = new URL(baseURL);
const isLocalBaseUrl = ['localhost', '127.0.0.1'].includes(parsedBaseUrl.hostname);
const devServerPort = Number(parsedBaseUrl.port || '3000');

export default defineConfig({
  testDir: './tests/e2e',
  
  // Keep e2e deterministic and reduce auth/session races.
  fullyParallel: false,
  
  // Fail the build on CI if you accidentally left test.only
  forbidOnly: !!process.env.CI,
  
  // Retry configuration
  retries: process.env.CI ? 2 : 1,
  
  // Workers
  workers: process.env.CI ? 1 : 1,
  
  // Reporter configuration
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  
  // Global test timeout
  timeout: 60000,
  
  // Expect timeout
  expect: {
    timeout: 10000,
  },
  
  use: {
    // Base URL for all tests
    baseURL,
    
    // Collect trace on failure for debugging
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video recording on failure
    video: 'on-first-retry',
    
    // Action timeout
    actionTimeout: 30000,
    
    // Navigation timeout
    navigationTimeout: 45000,
    
    // Viewport
    viewport: { width: 1280, height: 720 },
    
    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
  },

  // Keep a single browser project for faster and more stable CI runs.
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--disable-web-security'],
        },
      },
    },
  ],

  // Web server configuration for local development testing
  webServer: isLocalBaseUrl
    ? {
        command: `pnpm exec next dev -p ${devServerPort}`,
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120000,
        stdout: 'pipe',
        stderr: 'pipe',
      }
    : undefined,

  // Output directory for test artifacts
  outputDir: './test-results/',

  // Global setup/teardown
  globalSetup: './tests/e2e/global-setup.ts',
  // globalTeardown: './tests/e2e/global-teardown.ts',
});
