// Build de producción para las pruebas: igual que el real, pero contra la API simulada
// (tests/fixtures/mock-api.mjs) y con manifiesto para medir bundles. Sale a dist-perf/.
import { spawnSync } from 'node:child_process';

const port = process.env.MOCK_PORT || 8549;
const r = spawnSync('npx', ['vite', 'build', '--outDir', 'dist-perf', '--emptyOutDir', '--manifest'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, VITE_API_URL: `http://localhost:${port}` },
});
process.exit(r.status ?? 1);
