import { defineConfig } from '@playwright/test';
import { env } from './support/env';

// Bộ test chạy tuần tự (workers: 1) vì dùng chung DB local và danh mục; dữ liệu test dọn ở global setup/teardown.
export default defineConfig({
  testDir: '.',
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  globalSetup: './support/global-setup.ts',
  globalTeardown: './support/global-teardown.ts',
  use: {
    baseURL: env.baseUrl,
    viewport: { width: 1600, height: 1300 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'api', testMatch: 'api/**/*.spec.ts' },
    { name: 'e2e', testMatch: 'e2e/**/*.spec.ts' }
  ]
});
