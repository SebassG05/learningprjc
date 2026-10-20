// Perfil de CPU del montaje del globo en móvil (CPU 6x): desde el primer gesto hasta 4 s después.
// Agrega el tiempo propio por función original usando los sourcemaps del build servido.
//   PERF_BASE_URL=http://localhost:4174 node perf/scripts/profile-globe.mjs <dir-del-build-con-maps>
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import sourceMap from 'source-map-js';
import { launchOptions } from '../../tests/perf/lib/profiles.mjs';
import { openPage } from '../../tests/perf/lib/measure.mjs';

const DIST = process.argv[2];
const DEVICE = process.argv[3] || 'movil';
const b = await chromium.launch(launchOptions());
const { page, cdp, context } = await openPage(b, { device: DEVICE, cpu: 6, network: 'none' });
await page.waitForTimeout(3000);
await cdp.send('Profiler.enable');
await cdp.send('Profiler.setSamplingInterval', { interval: 200 });
await cdp.send('Profiler.start');
if (DEVICE === 'movil') {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 200, y: 600 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}
await page.waitForSelector('canvas', { timeout: 30_000 });
await page.waitForTimeout(4000);
const { profile } = await cdp.send('Profiler.stop');
await context.close();
await b.close();

const maps = new Map();
const consumer = (url) => {
  const file = path.join(DIST, new URL(url).pathname);
  if (!maps.has(file)) maps.set(file, fs.existsSync(`${file}.map`) ? new sourceMap.SourceMapConsumer(fs.readFileSync(`${file}.map`, 'utf8')) : null);
  return maps.get(file);
};
const dt = new Map();
profile.timeDeltas.forEach((d, i) => { const id = profile.samples[i]; dt.set(id, (dt.get(id) || 0) + d); });
const agg = new Map();
for (const n of profile.nodes) {
  const ms = (dt.get(n.id) || 0) / 1000;
  if (!ms) continue;
  const cf = n.callFrame;
  let key = cf.functionName || `(${cf.url ? 'anónima' : 'nativo'})`;
  if (cf.url?.startsWith('http')) {
    const c = consumer(cf.url);
    const p = c?.originalPositionFor({ line: cf.lineNumber + 1, column: cf.columnNumber });
    if (p?.source) key = `${p.source.split('node_modules/').pop().split('front_learningprjct/').pop()}:${p.line} ${p.name || cf.functionName || ''}`;
  }
  agg.set(key, (agg.get(key) || 0) + ms);
}
const total = [...agg.values()].reduce((a, b) => a + b, 0);
console.log(`total muestreado ${total.toFixed(0)} ms`);
[...agg.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25).forEach(([k, v]) => console.log(v.toFixed(1).padStart(8), 'ms', k));
