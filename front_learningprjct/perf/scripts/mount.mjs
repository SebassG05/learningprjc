// Coste de montar el globo 3D: frames y Long Animation Frames en los 5 s siguientes a su disparo.
// Cada ejecución lanza un navegador nuevo: Chrome guarda en caché los shaders compilados y una
// segunda visita no paga la compilación. Se mide la primera visita (caché en frío), la que da el tirón.
// Móvil: el globo se monta con la primera interacción (se simula un toque). Portátil: tras load + ocioso.
//   node perf/scripts/mount.mjs [--runs 5] [--out perf/runs/mount]
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { launchOptions } from '../../tests/perf/lib/profiles.mjs';
import { envFps, openPage } from '../../tests/perf/lib/measure.mjs';
import { startRecording, stopRecording, summarizeFrames } from '../../tests/perf/lib/page.mjs';

const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : def;
};
const RUNS = Number(arg('runs', 5));
const OUT = arg('out', 'perf/runs/mount');
const CELLS = [
  { device: 'movil', cpu: 6, network: 'none' },
  { device: 'movil', cpu: 4, network: 'none' },
  { device: 'portatil', cpu: 6, network: 'none' },
];
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

const out = [];
for (const cell of CELLS) {
  const runs = [];
  for (let i = 0, tries = 0; i < RUNS; i += 1) {
    const b = await chromium.launch(launchOptions());
    const env = await envFps(b, cell);
    if (env < 59 && tries < 5) { tries += 1; i -= 1; await b.close(); await new Promise((r) => setTimeout(r, 10_000)); continue; }
    const { page, cdp, context } = await openPage(b, cell);
    try {
      await page.waitForTimeout(cell.device === 'movil' ? 3000 : 0);
      await startRecording(page);
      if (cell.device === 'movil') {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 200, y: 600 }] });
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      }
      await page.waitForSelector('canvas', { timeout: 30_000 });
      await page.waitForTimeout(5000);
      const perf = await stopRecording(page);
      const s = summarizeFrames(perf);
      const r = { maxFrameMs: s.frameMaxMs, over50: s.over50, loafCount: s.loafCount, loafMs: Math.round(perf.loaf.reduce((a, l) => a + l.duration, 0)), blockingMs: s.loafBlockingMs };
      console.log(`${cell.device} cpu${cell.cpu} #${i + 1}: peor frame ${r.maxFrameMs} ms, >50 ms ${r.over50}, LoAF ${r.loafCount} (${r.loafMs} ms, bloqueo ${r.blockingMs} ms)`);
      runs.push(r);
    } finally {
      await context.close();
      await b.close();
    }
  }
  const m = Object.fromEntries(Object.keys(runs[0]).map((k) => [k, median(runs.map((r) => r[k]))]));
  console.log(`  mediana ${cell.device} cpu${cell.cpu}: ${JSON.stringify(m)}`);
  out.push({ ...cell, runs: RUNS, ...m, samples: runs });
}
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'mount.json'), JSON.stringify(out, null, 2));
