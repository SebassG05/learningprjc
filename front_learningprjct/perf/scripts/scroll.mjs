// Recorridos de scroll con CPU y red frenadas (matriz de profiles.mjs), N ejecuciones y mediana.
//   node perf/scripts/scroll.mjs --out perf/baseline [--runs 3] [--routes /,/sobre] [--only portatil] [--memory 120]
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { MATRIX, launchOptions } from '../../tests/perf/lib/profiles.mjs';
import { envFps, measureMemory, measureRoute } from '../../tests/perf/lib/measure.mjs';

const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : def;
};
const OUT = arg('out', 'perf/runs');
const RUNS = Number(arg('runs', 3));
const ROUTES = arg('routes', '/').split(',');
const ONLY = arg('only', '');
const CPU = arg('cpu', '');
const GPU = arg('gpu', '');
const MEMORY = Number(arg('memory', 0));
// Diagnóstico: CSS inyectado tras la carga (aísla el coste de una capa; nunca para el baseline)
const CSS = arg('css', '');
const BLOCK = arg('block', '');

const median = (xs) => { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

// Mediana campo a campo (numéricos, también dentro de `trace`); el resto se toma de la ejecución mediana en fps p5
function medianOf(runs) {
  const pick = [...runs].sort((a, b) => a.fpsP5 - b.fpsP5)[runs.length >> 1];
  const out = { ...pick, runs: runs.length };
  for (const k of Object.keys(pick)) if (typeof pick[k] === 'number') out[k] = +median(runs.map((r) => r[k])).toFixed(2);
  out.trace = { ...pick.trace };
  for (const k of Object.keys(pick.trace)) if (typeof pick.trace[k] === 'number') out.trace[k] = +median(runs.map((r) => r.trace[k])).toFixed(2);
  out.samples = runs.map((r) => ({ fpsMean: r.fpsMean, fpsP5: r.fpsP5, over16: r.over16, over50: r.over50, lcpMs: r.lcpMs, inpMs: r.inpMs }));
  return out;
}

fs.mkdirSync(OUT, { recursive: true });
const browsers = {};
const launch = async (gpu = 'real') => (browsers[gpu] ??= await chromium.launch(launchOptions(gpu)));
const browser = await launch();
const results = [];
try {
  for (const route of ROUTES) {
    for (const cell of MATRIX.filter((c) => (!ONLY || c.device === ONLY) && (!CPU || String(c.cpu) === CPU) && (!GPU || (c.gpu || 'real') === GPU))) {
      const runs = [];
      let retries = 0;
      for (let i = 0; i < RUNS; i += 1) {
        const b = await launch(cell.gpu);
        // Equipo de medición ocupado: se espera y se repite (máx. 12 reintentos por celda). Si no se
        // libera, la ejecución no se mide: una cifra tomada con la máquina ocupada no es comparable
        const env = cell.gpu === 'soft' ? null : await envFps(b, cell);
        if (env !== null && env < 59) {
          if (retries >= 12) throw new Error(`entorno ocupado de forma sostenida (${env} fps en página vacía): medición abortada`);
          retries += 1; i -= 1;
          console.log(`  entorno ocupado (${env} fps en página vacía): reintento ${retries}`);
          await new Promise((r) => setTimeout(r, 15_000));
          continue;
        }
        const r = { ...(await measureRoute(b, { ...cell, route, css: CSS, block: BLOCK || undefined })), envFps: env };
        console.log(`${route} ${cell.device} cpu${cell.cpu} ${cell.network}${cell.gpu ? ' gpu-' + cell.gpu : ''} #${i + 1} (entorno ${r.envFps}): fps ${r.fpsMean} p5 ${r.fpsP5} >16.7:${r.over16} >50:${r.over50} LoAF ${r.loafCount} main ${r.trace.mainBusyPct}% gpu ${r.trace.gpuBusyPct}% LCP ${r.lcpMs} INP ${r.inpMs} errs ${r.errors.length}`);
        runs.push(r);
      }
      results.push({ ...medianOf(runs), gpu: cell.gpu || 'real' });
    }
  }
  fs.writeFileSync(path.join(OUT, 'scroll.json'), JSON.stringify(results, null, 2));
  if (MEMORY) {
    const mem = [];
    for (const device of ['portatil', 'movil'].filter((d) => !ONLY || d === ONLY)) {
      const m = await measureMemory(browser, { device, cpu: 4, seconds: MEMORY });
      console.log(`memoria ${device}: ${m.start.heapMB} → ${m.end.heapMB} MB, nodos ${m.start.nodes} → ${m.end.nodes}, listeners ${m.start.listeners} → ${m.end.listeners} (${m.passes} pasadas)`);
      mem.push(m);
    }
    fs.writeFileSync(path.join(OUT, 'memory.json'), JSON.stringify(mem, null, 2));
  }
} finally {
  await Promise.all(Object.values(browsers).map((b) => b.close()));
}
