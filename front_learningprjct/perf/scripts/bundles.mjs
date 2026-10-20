// Tamaño de bundles por ruta (JS/CSS inicial y diferido; bruto, gzip y brotli) e inventario de
// imágenes, fuentes y modelos. Necesita un build con manifiesto: vite build --manifest
//   node perf/scripts/bundles.mjs --dist dist-perf --out perf/baseline
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : def;
};
const DIST = arg('dist', 'dist-perf');
const OUT = arg('out', 'perf/runs');

const manifest = JSON.parse(fs.readFileSync(path.join(DIST, '.vite/manifest.json'), 'utf8'));
const sizeOf = (file) => {
  const buf = fs.readFileSync(path.join(DIST, file));
  return {
    raw: buf.length,
    gzip: zlib.gzipSync(buf, { level: 9 }).length,
    brotli: zlib.brotliCompressSync(buf, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } }).length,
  };
};
const kb = (b) => +(b / 1024).toFixed(1);
const add = (a, b) => ({ raw: a.raw + b.raw, gzip: a.gzip + b.gzip, brotli: a.brotli + b.brotli });
const ZERO = { raw: 0, gzip: 0, brotli: 0 };
const fmt = (s) => ({ rawKB: kb(s.raw), gzipKB: kb(s.gzip), brotliKB: kb(s.brotli) });

// Cierre de imports estáticos desde una entrada del manifiesto
function closure(key, seen = new Set()) {
  if (seen.has(key)) return seen;
  seen.add(key);
  (manifest[key]?.imports || []).forEach((k) => closure(k, seen));
  return seen;
}
const filesOf = (keys) => {
  const js = new Set(); const css = new Set();
  keys.forEach((k) => { const m = manifest[k]; if (!m) return; if (m.file.endsWith('.js')) js.add(m.file); (m.css || []).forEach((c) => css.add(c)); });
  return { js: [...js], css: [...css] };
};
const total = (files) => files.reduce((s, f) => add(s, sizeOf(f)), ZERO);

const entryKey = Object.keys(manifest).find((k) => manifest[k].isEntry);
const initial = filesOf(closure(entryKey));
const initialSet = new Set([...initial.js, ...initial.css]);

// Rutas diferidas (React.lazy) y su coste añadido sobre el bundle inicial
const lazy = Object.keys(manifest).filter((k) => manifest[k].isDynamicEntry).map((k) => {
  const f = filesOf(closure(k));
  const extraJs = f.js.filter((x) => !initialSet.has(x));
  const extraCss = f.css.filter((x) => !initialSet.has(x));
  return { chunk: k, js: fmt(total(extraJs)), css: fmt(total(extraCss)), files: [...extraJs, ...extraCss] };
}).sort((a, b) => b.js.gzipKB - a.js.gzipKB);

// Módulos más pesados dentro de los chunks grandes: aproximación por fuente en el manifiesto no existe,
// así que se listan los chunks individuales
const chunks = Object.values(manifest).filter((m) => m.file.endsWith('.js')).map((m) => ({ file: m.file, src: m.src || m.name, ...fmt(sizeOf(m.file)) }))
  .sort((a, b) => b.gzipKB - a.gzipKB);

// Inventario de recursos estáticos
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]));
const kind = (f) => {
  const e = path.extname(f).toLowerCase();
  if (['.otf', '.ttf', '.woff', '.woff2'].includes(e)) return 'fuente';
  if (['.png', '.jpg', '.jpeg', '.webp', '.avif', '.svg', '.gif', '.ico'].includes(e)) return 'imagen';
  if (['.glb', '.gltf', '.obj', '.fbx', '.hdr', '.ktx2', '.basis'].includes(e)) return 'modelo/textura 3D';
  return null;
};
const assets = walk('public').map((f) => ({ file: path.relative('public', f).replace(/\\/g, '/'), kind: kind(f), KB: kb(fs.statSync(f).size) }))
  .filter((a) => a.kind).sort((a, b) => b.KB - a.KB);

const report = {
  initial: { js: fmt(total(initial.js)), css: fmt(total(initial.css)), files: [...initial.js, ...initial.css] },
  lazy,
  chunks: chunks.slice(0, 15),
  assets,
};
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'bundles.json'), JSON.stringify(report, null, 2));
console.log('Inicial JS', report.initial.js, 'CSS', report.initial.css);
lazy.slice(0, 6).forEach((l) => console.log('diferido', l.chunk, l.js));
assets.forEach((a) => console.log(a.kind, a.file, a.KB, 'KB'));
