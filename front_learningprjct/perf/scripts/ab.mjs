// A/B intercalado: mide dos builds alternándolos (A, B, A, B…) para que el ruido del equipo
// (otras pestañas, la GPU compartida) afecte por igual a los dos.
//   node perf/scripts/ab.mjs --a http://localhost:4175 --b http://localhost:4174 [--runs 4] [--device movil] [--cpu 6] [--route /]
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : def;
};
const A = arg('a'); const B = arg('b');
const RUNS = Number(arg('runs', 4));
const DEVICE = arg('device', 'movil');
const CPU = arg('cpu', '6');
const ROUTE = arg('route', '/');
const median = (xs) => { const s = [...xs].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const res = { A: [], B: [] };
for (let i = 0; i < RUNS; i += 1) {
  for (const [k, url] of (i % 2 ? [['B', B], ['A', A]] : [['A', A], ['B', B]])) {
    const out = `perf/runs/ab-${k}`;
    spawnSync('node', ['perf/scripts/scroll.mjs', '--out', out, '--runs', '1', '--gpu', 'real', '--only', DEVICE, '--cpu', CPU, '--routes', ROUTE],
      { env: { ...process.env, PERF_BASE_URL: url, MSYS_NO_PATHCONV: '1' }, stdio: 'ignore', shell: true });
    const r = JSON.parse(fs.readFileSync(`${out}/scroll.json`, 'utf8'))[0];
    res[k].push(r);
    console.log(`${k} #${Math.floor(i) + 1}: fps ${r.fpsMean} p5 ${r.fpsP5} >16.7 ${r.over16} >50 ${r.over50} bloqueo ${r.loafBlockingMs} main ${r.trace.mainBusyPct}%`);
  }
}
for (const k of ['A', 'B']) {
  const m = (f) => median(res[k].map(f));
  console.log(`mediana ${k}: fps ${m((r) => r.fpsMean)} p5 ${m((r) => r.fpsP5)} >16.7 ${m((r) => r.over16)} >50 ${m((r) => r.over50)} bloqueo ${m((r) => r.loafBlockingMs)} main ${m((r) => r.trace.mainBusyPct)}%`);
}
