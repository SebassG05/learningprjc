// Tiempo PROPIO del hilo principal por tipo de evento durante un recorrido (qué hace el navegador:
// estilo, layout, pintado, commit, JS…). --block GlobeCanvas para medir sin el globo.
//   node perf/scripts/mainthread.mjs [--route /] [--device movil] [--cpu 4] [--block patrón]
import { chromium } from '@playwright/test';
import { launchOptions } from '../../tests/perf/lib/profiles.mjs';
import { openPage, scrollJourney } from '../../tests/perf/lib/measure.mjs';

const arg = (name, def) => { const i = process.argv.indexOf(`--${name}`); return i > -1 ? process.argv[i + 1] : def; };
const b = await chromium.launch(launchOptions());
const opts = { device: arg('device', 'movil'), cpu: Number(arg('cpu', 4)), network: 'none', route: arg('route', '/'), block: arg('block', '') || undefined, css: arg('css', '') || undefined };
const { page, cdp, context, dev } = await openPage(b, opts);
await page.waitForTimeout(2000);
if (dev.touch && !opts.block) {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 200, y: 600 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await page.waitForSelector('canvas', { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(2000);
}
await b.startTracing(page, { categories: ['toplevel', 'devtools.timeline', 'disabled-by-default-devtools.timeline', 'blink', 'cc', 'gpu'] });
await scrollJourney(page, cdp, { touch: dev.touch, direction: 'down' });
const ev = JSON.parse((await b.stopTracing()).toString()).traceEvents;
await context.close(); await b.close();

const names = new Map();
ev.forEach((e) => { if (e.ph === 'M' && e.name === 'thread_name') names.set(`${e.pid}:${e.tid}`, e.args.name); });
const byThread = new Map();
ev.forEach((e) => { if (e.ph === 'X' && e.dur) { const k = `${e.pid}:${e.tid}`; if (!byThread.has(k)) byThread.set(k, []); byThread.get(k).push(e); } });
const mains = [...byThread.keys()].filter((k) => names.get(k) === 'CrRendererMain');
const main = mains.sort((a, c) => byThread.get(c).length - byThread.get(a).length)[0];
const list = byThread.get(main).sort((a, c) => a.ts - c.ts || c.dur - a.dur);
// Tiempo propio = duración menos la de sus hijos directos
const self = new Map();
const stack = [];
for (const e of list) {
  while (stack.length && stack.at(-1).ts + stack.at(-1).dur <= e.ts) stack.pop();
  if (stack.length) { const p = stack.at(-1); self.set(p, (self.get(p) ?? p.dur) - e.dur); }
  if (!self.has(e)) self.set(e, e.dur);
  stack.push(e);
}
const agg = new Map();
for (const [e, us] of self) agg.set(e.name, (agg.get(e.name) || 0) + Math.max(0, us) / 1000);
const span = (list.at(-1).ts - list[0].ts) / 1e6;
console.log(`${opts.route} ${opts.device} cpu${opts.cpu}${opts.block ? ' (sin ' + opts.block + ')' : ''}${opts.css ? ' css: ' + opts.css : ''}: ${span.toFixed(1)} s`);
[...agg.entries()].sort((a, c) => c[1] - a[1]).slice(0, 16).forEach(([k, v]) => console.log(`  ${v.toFixed(0).padStart(6)} ms  ${k}`));
