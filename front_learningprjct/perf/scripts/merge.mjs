// Junta varias mediciones de una ejecución (p. ej. las tandas de un A/B intercalado) en una sola,
// con la mediana campo a campo por celda (ruta + dispositivo + CPU + GPU, o ruta + forma).
//   node perf/scripts/merge.mjs --out perf/after perf/runs/fin-B-1 perf/runs/fin-B-2 perf/runs/fin-B-3
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const OUT = args[args.indexOf('--out') + 1];
const dirs = args.filter((a, i) => a !== '--out' && args[i - 1] !== '--out');
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const load = (d, f) => { try { return JSON.parse(fs.readFileSync(path.join(d, f), 'utf8')); } catch { return []; } };

function mergeCells(rows, keyOf) {
  const groups = new Map();
  rows.forEach((r) => { const k = keyOf(r); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(r); });
  return [...groups.values()].map((rs) => {
    const num = (o, k) => typeof o[k] === 'number';
    // Representante: la ejecución mediana en el primer campo numérico relevante (para listas y textos)
    const rep = [...rs].sort((a, b) => (a.fpsP5 ?? a.score ?? 0) - (b.fpsP5 ?? b.score ?? 0))[rs.length >> 1];
    const out = { ...rep, runs: rs.length };
    Object.keys(rep).forEach((k) => { if (num(rep, k)) out[k] = +median(rs.map((r) => r[k])).toFixed(3); });
    if (rep.trace) {
      out.trace = { ...rep.trace };
      Object.keys(rep.trace).forEach((k) => { if (num(rep.trace, k)) out.trace[k] = +median(rs.map((r) => r.trace[k])).toFixed(2); });
    }
    if (rep.sections) {
      out.sections = rep.sections.map((s) => {
        const all = rs.map((r) => r.sections?.find((x) => x.section === s.section)).filter(Boolean);
        return { ...s, droppedPct: +median(all.map((x) => x.droppedPct)).toFixed(1), worstMs: median(all.map((x) => x.worstMs)) };
      });
    }
    return out;
  });
}

fs.mkdirSync(OUT, { recursive: true });
const scroll = dirs.flatMap((d) => load(d, 'scroll.json'));
if (scroll.length) fs.writeFileSync(path.join(OUT, 'scroll.json'), JSON.stringify(mergeCells(scroll, (r) => `${r.route}|${r.device}|${r.cpu}|${r.gpu}`), null, 2));
const lh = dirs.flatMap((d) => load(d, 'lighthouse.json'));
if (lh.length) fs.writeFileSync(path.join(OUT, 'lighthouse.json'), JSON.stringify(mergeCells(lh, (r) => `${r.route}|${r.form}`), null, 2));
const mount = dirs.flatMap((d) => load(d, 'mount.json'));
if (mount.length) fs.writeFileSync(path.join(OUT, 'mount.json'), JSON.stringify(mergeCells(mount, (r) => `${r.device}|${r.cpu}`), null, 2));
console.log(`fusionado en ${OUT}: ${scroll.length} recorridos, ${lh.length} Lighthouse, ${mount.length} montajes`);
