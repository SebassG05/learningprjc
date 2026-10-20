// Tablas Markdown a partir de los JSON de una medición (scroll, lighthouse, memory, bundles).
// Con --compare <dir> añade la columna «después» y la variación.
//   node perf/scripts/tables.mjs --dir perf/baseline [--compare perf/after] > tablas.md
import fs from 'node:fs';
import path from 'node:path';

const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : def;
};
const DIR = arg('dir', 'perf/baseline');
const CMP = arg('compare', '');
const load = (dir, f) => { try { return JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch { return null; } };

const row = (cells) => `| ${cells.join(' | ')} |`;
const table = (head, rows) => [row(head), row(head.map(() => '---')), ...rows.map(row)].join('\n');
const n = (v, d = 0) => (v == null ? '—' : Number(v).toLocaleString('es-ES', { maximumFractionDigits: d, minimumFractionDigits: d }));
const delta = (a, b, d = 0) => {
  if (a == null || b == null) return '';
  const diff = b - a;
  const pct = a ? ` (${diff >= 0 ? '+' : ''}${n((100 * diff) / a, 0)} %)` : '';
  return `${n(a, d)} → **${n(b, d)}**${pct}`;
};
const cell = (a, b, d = 0) => (b === undefined ? n(a, d) : delta(a, b, d));

const label = (r) => `${r.device === 'movil' ? 'Móvil' : 'Portátil'} · ${r.gpu === 'soft' ? 'GPU software' : `CPU ${r.cpu}x · ${r.network}`}`;
const out = [];

const scroll = load(DIR, 'scroll.json');
const scroll2 = CMP ? load(CMP, 'scroll.json') : null;
if (scroll) {
  const find = (r) => scroll2?.find((x) => x.device === r.device && x.cpu === r.cpu && x.gpu === r.gpu && x.route === r.route);
  out.push(`### Recorrido de scroll completo (mediana de ${scroll[0].runs} ejecuciones)\n`);
  out.push(table(
    ['Ruta · perfil', 'FPS medio', 'FPS p5', 'Frames > 16,7 ms', 'Frames > 50 ms', 'LoAF (bloqueo ms)', 'Main thread ocupado', 'GPU ocupada', 'Recálculos de estilo forzados', 'Layouts forzados', 'LCP (ms)', 'INP (ms)', 'CLS'],
    scroll.map((r) => {
      const b = find(r);
      const c = (k, d) => cell(r[k], b ? b[k] : undefined, d);
      const t = (k, d) => cell(r.trace[k], b ? b.trace[k] : undefined, d);
      return [`${r.route} · ${label(r)}`, c('fpsMean', 1), c('fpsP5', 1), c('over16'), c('over50'), `${c('loafCount')} (${c('loafBlockingMs')})`,
        `${t('mainBusyPct', 1)} %`, `${t('gpuBusyPct', 1)} %`, t('forcedStyles'), t('forcedLayouts'), c('lcpMs'), c('inpMs'), c('cls', 3)];
    }),
  ));
  // Etiquetas de sección: el titular aparece repetido (texto accesible + palabras animadas)
  const clean = (t) => {
    for (let k = 4; k < t.length; k += 1) {
      const rest = t.slice(k);
      if (rest.length >= 4 && t.startsWith(rest.slice(0, Math.min(k, rest.length)))) return t.slice(0, k);
    }
    return t;
  };
  for (const route of [...new Set(scroll.map((r) => r.route))]) {
    const rs = scroll.filter((r) => r.route === route);
    const secNames = [...new Set(rs.flatMap((r) => r.sections.map((x) => x.section)))];
    out.push(`\n#### ${route} · frames perdidos por escena (% de frames > 16,7 ms; entre paréntesis, el peor frame)\n`);
    out.push(table(['Perfil', ...secNames.map(clean)], rs.map((r) => [label(r), ...secNames.map((sn) => {
      const a = r.sections.find((x) => x.section === sn);
      const b = find(r)?.sections.find((x) => x.section === sn);
      return a ? (b ? delta(a.droppedPct, b.droppedPct, 1) : `${n(a.droppedPct, 1)} % (${a.worstMs} ms)`) : '—';
    })])));
  }
}

const lh = load(DIR, 'lighthouse.json');
const lh2 = CMP ? load(CMP, 'lighthouse.json') : null;
if (lh) {
  out.push(`\n### Lighthouse (mediana de ${lh[0].runs} ejecuciones, visita de primera vez)\n`);
  out.push(table(
    ['Ruta', 'Forma', 'Puntuación', 'FCP (ms)', 'LCP (ms)', 'TBT (ms)', 'CLS', 'Speed Index (ms)', 'Peso total (KB)', 'JS (KB)'],
    lh.map((r) => {
      const b = lh2?.find((x) => x.route === r.route && x.form === r.form);
      const c = (k, d) => cell(r[k], b ? b[k] : undefined, d);
      return [r.route, r.form === 'mobile' ? 'móvil' : 'escritorio', c('score'), c('fcpMs'), c('lcpMs'), c('tbtMs'), c('cls', 3), c('siMs'), c('totalKB'), c('jsKB')];
    }),
  ));
}

const mem = load(DIR, 'memory.json');
const mem2 = CMP ? load(CMP, 'memory.json') : null;
if (mem) {
  out.push(`\n### Memoria (tras GC, al inicio y tras ${mem[0].seconds} s de scroll continuo)\n`);
  out.push(table(['Perfil', 'Heap inicio (MB)', 'Heap final (MB)', 'Crecimiento (MB)', 'Nodos DOM', 'Listeners JS', 'Pasadas'],
    mem.map((m) => {
      const b = mem2?.find((x) => x.device === m.device);
      return [m.device === 'movil' ? 'Móvil' : 'Portátil', cell(m.start.heapMB, b?.start.heapMB, 1), cell(m.end.heapMB, b?.end.heapMB, 1), cell(m.heapGrowthMB, b?.heapGrowthMB, 2),
        `${m.start.nodes} → ${m.end.nodes}`, `${m.start.listeners} → ${m.end.listeners}`, m.passes];
    })));
}

const bun = load(DIR, 'bundles.json');
const bun2 = CMP ? load(CMP, 'bundles.json') : null;
if (bun) {
  out.push('\n### Bundles\n');
  const f = (s, s2) => `${cell(s.rawKB, s2?.rawKB, 1)} / ${cell(s.gzipKB, s2?.gzipKB, 1)} / ${cell(s.brotliKB, s2?.brotliKB, 1)}`;
  const rows = [['JS inicial (todas las rutas)', f(bun.initial.js, bun2?.initial.js)], ['CSS inicial', f(bun.initial.css, bun2?.initial.css)]];
  bun.lazy.slice(0, 12).forEach((l) => {
    const b = bun2?.lazy.find((x) => x.chunk === l.chunk);
    rows.push([`diferido: ${l.chunk.replace(/^src\//, '')}`, f(l.js, b?.js)]);
  });
  out.push(table(['Paquete', 'KB bruto / gzip / brotli'], rows));
  out.push('\n#### Inventario de recursos estáticos (public/)\n');
  out.push(table(['Tipo', 'Fichero', 'KB'], bun.assets.map((a) => [a.kind, a.file, n(a.KB, 1)])));
}

console.log(out.join('\n'));
