// Perfil de CPU del montaje del globo en móvil (CPU 6x): desde el primer gesto hasta 4 s después.
// Agrega el tiempo propio por función original usando los sourcemaps del build servido.
//   PERF_BASE_URL=http://localhost:4174 node perf/scripts/profile-globe.mjs <dir-del-build-con-maps>
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import sourceMap from 'source-map-js';
import { launchOptions } from '../../tests/perf/lib/profiles.mjs';
import { openPage, scrollJourney } from '../../tests/perf/lib/measure.mjs';
import { startRecording, stopRecording } from '../../tests/perf/lib/page.mjs';

const DIST = process.argv[2];
const DEVICE = process.argv[3] || 'movil';
// 'montaje' (por defecto): desde el primer gesto. 'scroll': con el globo ya montado, durante un recorrido
const MODE = process.argv[4] || 'montaje';
const CPU = Number(process.argv[5] || (MODE === 'scroll' ? 4 : 6));
const b = await chromium.launch(launchOptions());
const { page, cdp, context, dev } = await openPage(b, { device: DEVICE, cpu: CPU, network: 'none', block: process.env.BLOCK || undefined });
await page.waitForTimeout(3000);
await cdp.send('Profiler.enable');
await cdp.send('Profiler.setSamplingInterval', { interval: 200 });
if (MODE === 'scroll') {
  if (DEVICE === 'movil') {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 200, y: 600 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }
  if (!process.env.BLOCK) await page.waitForSelector('canvas', { timeout: 30_000 });
  await page.waitForTimeout(3000);
}
await startRecording(page);
await cdp.send('Profiler.start');
if (MODE === 'scroll') {
  await scrollJourney(page, cdp, { touch: dev.touch, direction: 'down' });
} else {
  if (DEVICE === 'movil') {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 200, y: 600 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }
  await page.waitForSelector('canvas', { timeout: 30_000 });
  await page.waitForTimeout(4000);
}
const { profile } = await cdp.send('Profiler.stop');
const perf = await stopRecording(page);
console.log('LoAF (duración = script + estilo/layout + render):');
if (MODE !== 'scroll') perf.loaf.forEach((l) => {
  const script = l.scripts.reduce((a, x) => a + x.dur, 0);
  console.log(`  ${Math.round(l.duration)} ms  script ${Math.round(script)}  estilo/layout ${Math.round(l.styleLayout)}  render ${Math.round(l.render)}  | ${l.scripts.map((x) => `${x.fn || x.inv}@${x.pos}:${Math.round(x.dur)}`).join(' ')}`);
});
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
// Cadena de llamadas hasta una función (CALLERS=nombre): quién la invoca y cuánto pesa cada camino
if (process.env.CALLERS) {
  const byId = new Map(profile.nodes.map((n) => [n.id, n]));
  const parent = new Map();
  profile.nodes.forEach((n) => (n.children || []).forEach((c) => parent.set(c, n.id)));
  const name = (n) => {
    const cf = n.callFrame;
    if (!cf.url?.startsWith('http')) return cf.functionName || '(nativo)';
    const p = consumer(cf.url)?.originalPositionFor({ line: cf.lineNumber + 1, column: cf.columnNumber });
    return p?.source ? `${p.source.split('node_modules/').pop().split('front_learningprjct/').pop()}:${p.line} ${p.name || cf.functionName || ''}` : cf.functionName;
  };
  const incl = new Map();
  const inclusive = (id) => { if (incl.has(id)) return incl.get(id); const n = byId.get(id); const v = (dt.get(id) || 0) / 1000 + (n.children || []).reduce((a, c) => a + inclusive(c), 0); incl.set(id, v); return v; };
  const paths = new Map();
  for (const n of profile.nodes) {
    if (!name(n).includes(process.env.CALLERS)) continue;
    const chain = [];
    let id = parent.get(n.id);
    for (let k = 0; id && k < 7; k += 1) { chain.push(name(byId.get(id)).replace(/^.*\//, '')); id = parent.get(id); }
    const key = chain.join(' ← ');
    paths.set(key, (paths.get(key) || 0) + inclusive(n.id));
  }
  [...paths.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).forEach(([k, v]) => console.log(`${v.toFixed(1).padStart(7)} ms  ${k}`));
}
// GROUP=1: tiempo propio agrupado por origen (paquete o carpeta de src)
if (process.env.GROUP) {
  const groups = new Map();
  for (const [k, v] of agg) {
    const g = k.startsWith('(') ? k : k.startsWith('src/') ? k.split(':')[0] : k.split('/')[0].startsWith('@') ? k.split('/').slice(0, 2).join('/') : k.split('/')[0].split(':')[0];
    groups.set(g, (groups.get(g) || 0) + v);
  }
  console.log('por origen:');
  [...groups.entries()].sort((a, b) => b[1] - a[1]).slice(0, 16).forEach(([k, v]) => console.log(`  ${v.toFixed(0).padStart(6)} ms  ${k}`));
}
const total = [...agg.values()].reduce((a, b) => a + b, 0);
console.log(`total muestreado ${total.toFixed(0)} ms`);
[...agg.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30).forEach(([k, v]) => console.log(v.toFixed(1).padStart(8), 'ms', k));
