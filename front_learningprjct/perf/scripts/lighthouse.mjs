// Lighthouse (móvil y escritorio) sobre el build de producción: N ejecuciones por ruta y mediana.
// Visita de primera vez real: sin consentimiento de cookies previo y con los scripts de terceros.
//   node perf/scripts/lighthouse.mjs --out perf/baseline [--runs 3] [--routes /,/cursos]
import fs from 'node:fs';
import path from 'node:path';
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';
import * as chromeLauncher from 'chrome-launcher';
import { BASE_URL } from '../../tests/perf/lib/profiles.mjs';

const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : def;
};
const OUT = arg('out', 'perf/runs');
const RUNS = Number(arg('runs', 3));
const ROUTES = arg('routes', '/,/cursos,/sobre,/contacto,/reseñas').split(',');
const FORMS = arg('forms', 'mobile,desktop').split(',');

const median = (xs) => { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };

function summary(lhr) {
  const a = lhr.audits;
  const items = a['resource-summary']?.details?.items || [];
  const kb = (type) => Math.round((items.find((i) => i.resourceType === type)?.transferSize || 0) / 1024);
  return {
    score: Math.round(lhr.categories.performance.score * 100),
    fcpMs: Math.round(a['first-contentful-paint'].numericValue),
    lcpMs: Math.round(a['largest-contentful-paint'].numericValue),
    tbtMs: Math.round(a['total-blocking-time'].numericValue),
    cls: +a['cumulative-layout-shift'].numericValue.toFixed(3),
    siMs: Math.round(a['speed-index'].numericValue),
    totalKB: Math.round(a['total-byte-weight'].numericValue / 1024),
    jsKB: kb('script'), cssKB: kb('stylesheet'), fontKB: kb('font'), imgKB: kb('image'), thirdPartyKB: kb('third-party'),
    lcpElement: a['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node?.snippet?.slice(0, 120) || '',
    mainThreadMs: Math.round(a['mainthread-work-breakdown']?.numericValue || 0),
    bootupMs: Math.round(a['bootup-time']?.numericValue || 0),
    unusedJsKB: Math.round((a['unused-javascript']?.details?.overallSavingsBytes || 0) / 1024),
  };
}

fs.mkdirSync(OUT, { recursive: true });
const htmlDir = path.join('perf/runs/lighthouse-html', path.basename(OUT));
fs.mkdirSync(htmlDir, { recursive: true });
const results = [];
for (const route of ROUTES) {
  for (const form of FORMS) {
    const runs = [];
    for (let i = 0; i < RUNS; i += 1) {
      const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new', '--no-first-run'] });
      try {
        const res = await lighthouse(`${BASE_URL}${encodeURI(route)}`, { port: chrome.port, output: 'html', onlyCategories: ['performance'], logLevel: 'error' }, form === 'desktop' ? desktopConfig : undefined);
        const s = summary(res.lhr);
        runs.push({ ...s, html: res.report });
        console.log(`${route} ${form} #${i + 1}: score ${s.score} LCP ${s.lcpMs} TBT ${s.tbtMs} CLS ${s.cls} SI ${s.siMs} ${s.totalKB} KB`);
      } finally {
        await chrome.kill();
      }
    }
    const pick = [...runs].sort((a, b) => a.score - b.score)[runs.length >> 1];
    fs.writeFileSync(path.join(htmlDir, `${form}${route.replace(/\//g, '_') || '_'}.html`), pick.html);
    const out = { route, form, runs: RUNS };
    for (const k of Object.keys(pick)) {
      if (k === 'html') continue;
      out[k] = typeof pick[k] === 'number' ? median(runs.map((r) => r[k])) : pick[k];
    }
    out.samples = runs.map((r) => ({ score: r.score, lcpMs: r.lcpMs, tbtMs: r.tbtMs }));
    results.push(out);
  }
}
fs.writeFileSync(path.join(OUT, 'lighthouse.json'), JSON.stringify(results, null, 2));
