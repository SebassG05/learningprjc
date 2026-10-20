// ¿En qué etapa se pierde un frame? Recorre una ruta con traza de Chrome (PipelineReporter) y, para
// los frames lentos o descartados, suma el tiempo de cada etapa del pipeline de render.
//   node perf/scripts/pipeline.mjs [--route /] [--device movil] [--cpu 4]
import { chromium } from '@playwright/test';
import { launchOptions } from '../../tests/perf/lib/profiles.mjs';
import { openPage, scrollJourney } from '../../tests/perf/lib/measure.mjs';

const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : def;
};
const ROUTE = arg('route', '/');
const DEVICE = arg('device', 'movil');
const CPU = Number(arg('cpu', 4));

const b = await chromium.launch(launchOptions());
const { page, cdp, context, dev } = await openPage(b, { device: DEVICE, cpu: CPU, network: 'none', route: ROUTE });
await page.waitForTimeout(3000);
await b.startTracing(page, { categories: ['benchmark', 'cc', 'viz', 'gpu', 'toplevel', 'disabled-by-default-devtools.timeline.frame'] });
await scrollJourney(page, cdp, { touch: dev.touch, direction: 'down' });
const trace = JSON.parse((await b.stopTracing()).toString()).traceEvents;
await context.close();
await b.close();

// Eventos asíncronos anidados (ph b/e) de PipelineReporter: el padre es el frame, los hijos sus etapas
const open = new Map();
const spans = [];
for (const e of trace) {
  if (!e.cat?.includes('benchmark') && !e.cat?.includes('cc')) continue;
  const key = `${e.id2?.local ?? e.id ?? ''}:${e.name}`;
  if (e.ph === 'b') open.set(key, e);
  else if (e.ph === 'e' && open.has(key)) {
    const s = open.get(key);
    open.delete(key);
    spans.push({ name: e.name, id: e.id2?.local ?? e.id, ts: s.ts, dur: (e.ts - s.ts) / 1000, args: s.args });
  }
}
const frames = spans.filter((s) => s.name === 'PipelineReporter');
const stages = spans.filter((s) => s.name !== 'PipelineReporter');
const states = {};
frames.forEach((f) => { const st = f.args?.chrome_frame_reporter?.state ?? '?'; states[st] = (states[st] || 0) + 1; });
console.log(`${ROUTE} ${DEVICE} cpu${CPU}: ${frames.length} frames en la traza`, states);

const slow = frames.filter((f) => f.dur > 18 || /DROPPED|PARTIAL/.test(f.args?.chrome_frame_reporter?.state ?? ''));
const agg = {};
for (const f of slow) {
  const mine = stages.filter((s) => s.id === f.id && s.ts >= f.ts && s.ts <= f.ts + f.dur * 1000);
  mine.forEach((s) => { agg[s.name] = (agg[s.name] || 0) + s.dur; });
}
console.log(`frames lentos o descartados: ${slow.length}. Tiempo por etapa (suma, ms):`);
Object.entries(agg).sort((a, b) => b[1] - a[1]).slice(0, 12).forEach(([k, v]) => console.log(`  ${v.toFixed(0).padStart(7)}  ${k}`));
const reasons = {};
slow.forEach((f) => { const r = f.args?.chrome_frame_reporter?.frame_drop_reason ?? f.args?.chrome_frame_reporter?.scroll_state ?? '?'; reasons[r] = (reasons[r] || 0) + 1; });
console.log('motivos:', reasons);
