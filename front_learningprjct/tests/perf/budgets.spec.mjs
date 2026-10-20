// Presupuestos de rendimiento: fallan si un recorrido real se sale de los umbrales de perf/budgets.json.
// Cada caso se mide BUDGET_RUNS veces (3 por defecto) y se toma la mediana; antes de cada ejecución se
// calibra el equipo (página vacía) para no dar por mala una medición tomada con la máquina ocupada.
import fs from 'node:fs';
import path from 'node:path';
import { test, expect, chromium } from '@playwright/test';
import { launchOptions } from './lib/profiles.mjs';
import { envFps, measureRoute } from './lib/measure.mjs';

const budgets = JSON.parse(fs.readFileSync(path.resolve('perf/budgets.json'), 'utf8'));
const RUNS = Number(process.env.BUDGET_RUNS || 3);
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

let browser;
test.beforeAll(async () => { browser = await chromium.launch(launchOptions()); });
test.afterAll(async () => { await browser?.close(); });

for (const c of budgets.scroll) {
  test(`scroll ${c.route} · ${c.device} · CPU ${c.cpu}x`, async () => {
    const runs = [];
    for (let i = 0, tries = 0; i < RUNS; i += 1) {
      const env = await envFps(browser, c);
      if (env < 59 && tries < 5) { tries += 1; i -= 1; await new Promise((r) => setTimeout(r, 10_000)); continue; }
      runs.push(await measureRoute(browser, c));
    }
    const m = (k) => median(runs.map((r) => r[k]));
    const report = { fpsP5: m('fpsP5'), fpsMean: m('fpsMean'), over50: m('over50'), cls: m('cls'), lcpMs: m('lcpMs'), inpMs: m('inpMs') };
    test.info().annotations.push({ type: 'medianas', description: JSON.stringify(report) });
    const errors = runs.flatMap((r) => r.errors);
    expect(errors, 'errores en consola').toEqual([]);
    const max = c.max;
    if (max.fpsP5Min != null) expect(report.fpsP5, 'FPS p5 durante el scroll').toBeGreaterThanOrEqual(max.fpsP5Min);
    if (max.fpsMeanMin != null) expect(report.fpsMean, 'FPS medio').toBeGreaterThanOrEqual(max.fpsMeanMin);
    if (max.over50 != null) expect(report.over50, 'frames > 50 ms').toBeLessThanOrEqual(max.over50);
    if (max.cls != null) expect(report.cls, 'CLS').toBeLessThanOrEqual(max.cls);
    if (max.lcpMs != null) expect(report.lcpMs, 'LCP (ms)').toBeLessThanOrEqual(max.lcpMs);
    if (max.inpMs != null && report.inpMs != null) expect(report.inpMs, 'INP (ms)').toBeLessThanOrEqual(max.inpMs);
  });
}

test('tamaño de bundles', async () => {
  const { spawnSync } = await import('node:child_process');
  const r = spawnSync('node', ['perf/scripts/bundles.mjs', '--dist', 'dist-perf', '--out', 'perf/runs/budget'], { encoding: 'utf8', shell: true });
  expect(r.status, r.stderr).toBe(0);
  const b = JSON.parse(fs.readFileSync('perf/runs/budget/bundles.json', 'utf8'));
  expect(b.initial.js.gzipKB, 'JS inicial (gzip KB)').toBeLessThanOrEqual(budgets.bundles.initialJsGzipKB);
  expect(b.initial.css.gzipKB, 'CSS inicial (gzip KB)').toBeLessThanOrEqual(budgets.bundles.initialCssGzipKB);
  const globe = b.lazy.find((l) => l.chunk.includes('GlobeCanvas'));
  if (globe) expect(globe.js.gzipKB, 'chunk del globo (gzip KB)').toBeLessThanOrEqual(budgets.bundles.globeJsGzipKB);
});
