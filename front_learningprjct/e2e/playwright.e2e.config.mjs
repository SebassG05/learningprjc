// Prueba de extremo a extremo de Dudas contra un backend local con Mongo en memoria (nunca la API de producción).
// No la recogen `test:perf` ni `test:visual` (esos usan tests/perf y tests/visual con playwright.config.mjs).
//
// Antes de ejecutarla (ver e2e/dudas.spec.js):
//   1. cd backend_learningprjct && node scripts/e2e/dudasServer.mjs                 (puerto 8551)
//   2. cd front_learningprjct && VITE_API_URL=http://localhost:8551 npx vite build --outDir dist-e2e
//      npx vite preview --outDir dist-e2e --port 5175 --strictPort
//   3. npx playwright test -c e2e/playwright.e2e.config.mjs
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: /dudas\.spec\.js$/,
  timeout: 300_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  outputDir: '../test-results/e2e-dudas',
  use: {
    baseURL: 'http://localhost:5175',
    channel: 'chrome',
    headless: true,
    viewport: { width: 1440, height: 900 },
    locale: 'es-ES',
    serviceWorkers: 'block',
    reducedMotion: 'reduce',
    launchOptions: { args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
