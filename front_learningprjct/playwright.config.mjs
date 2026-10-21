// Pruebas de rendimiento (tests/perf) y regresión visual (tests/visual) sobre el build de producción
// servido con `vite preview` y la API simulada. Uso: npm run test:perf | npm run test:visual
import { defineConfig } from '@playwright/test';
import { launchOptions } from './tests/perf/lib/profiles.mjs';

const MOCK_PORT = Number(process.env.MOCK_PORT || 8549);

export default defineConfig({
  timeout: 180_000,
  fullyParallel: false,
  workers: 1, // las mediciones de rendimiento no admiten ejecuciones en paralelo
  reporter: [['list'], ['html', { open: 'never' }]],
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.002, threshold: 0.15, animations: 'disabled', caret: 'hide' },
  },
  use: {
    baseURL: 'http://localhost:4173',
    launchOptions: launchOptions(),
    serviceWorkers: 'block',
  },
  projects: [
    { name: 'visual', testDir: 'tests/visual', snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}' },
    { name: 'perf', testDir: 'tests/perf' },
  ],
  webServer: [
    { command: 'node tests/fixtures/mock-api.mjs', port: MOCK_PORT, reuseExistingServer: true },
    { command: 'npx vite preview --outDir dist-perf --port 4173 --strictPort', port: 4173, reuseExistingServer: true },
  ],
});
