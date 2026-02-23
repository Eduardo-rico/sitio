import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration
 * Comprehensive E2E test configuration with mobile support
 */
export default defineConfig({
  testDir: './tests/e2e',
  
  // Run tests in parallel (fully independent)
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only
  forbidOnly: !!process.env.CI,
  
  // Retry configuration
  retries: process.env.CI ? 2 : 1,
  
  // Workers
  workers: process.env.CI ? 2 : undefined,
  
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
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    
    // Collect trace on failure for debugging
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video recording on failure
    video: 'on-first-retry',
    
    // Action timeout
    actionTimeout: 15000,
    
    // Navigation timeout
    navigationTimeout: 15000,
    
    // Viewport
    viewport: { width: 1280, height: 720 },
    
    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
  },

  // Project configurations for different browsers and devices
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--disable-web-security'],
        },
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile devices
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'iPad',
      use: { ...devices['iPad (gen 7)'] },
    },

    // Tablet
    {
      name: 'Tablet Chrome',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 1024 },
      },
    },

    // Responsive breakpoints
    {
      name: 'sm',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 640, height: 800 },
      },
    },
    {
      name: 'md',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 900 },
      },
    },
    {
      name: 'lg',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1024, height: 768 },
      },
    },
    {
      name: 'xl',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: '2xl',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1536, height: 900 },
      },
    },
  ],

  // Web server configuration for local development testing
  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe',
  },

  // Output directory for test artifacts
  outputDir: './test-results/',

  // Global setup/teardown
  globalSetup: './tests/e2e/global-setup.ts',
  // globalTeardown: './tests/e2e/global-teardown.ts',
});
