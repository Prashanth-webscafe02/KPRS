import { defineConfig } from '@playwright/test';

// Legacy Vite reference on :5174 (npm run legacy:dev), Next.js on :3100 (npm run dev).
// Both servers are expected to be running; set NEXT_URL to test a production build.
export default defineConfig({
  testDir: './tests',
  timeout: 30 * 60_000,
  // generous: headless WebGL runs on SwiftShader (CPU), so frames are slow
  expect: { timeout: 15_000 },
  workers: 1,
  reporter: [['list']],
  use: {
    browserName: 'chromium',
    launchOptions: {
      // headless WebGL via SwiftShader
      args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
    },
  },
});
