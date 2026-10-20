// Preparación común de una página medida: consentimiento de cookies ya dado (el banner difumina
// la página), terceros bloqueados (red no determinista) e instrumentación de frames y métricas web.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const AVATAR = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#2b3a26"/><text x="20" y="26" font-size="16" text-anchor="middle" fill="#cfe9c2" font-family="sans-serif">A</text></svg>';
const FAVICON = fs.readFileSync(path.resolve(here, '../../../public/vite.svg'));

// Se ejecuta en la página antes que cualquier script de la app
function instrument() {
  try {
    localStorage.setItem('evenortech_cookie_consent', 'true');
    localStorage.setItem('evenortech_cookie_consent_date', new Date().toISOString());
    localStorage.setItem('evenortech_cookie_preferences', JSON.stringify({ necessary: true, functional: false, analytics: false, marketing: false }));
  } catch { /* sin almacenamiento */ }

  const perf = {
    frames: [], ys: [], recording: false,
    loaf: [], longtasks: [], lcp: 0, lcpEl: '', cls: 0, events: [],
  };
  window.__perf = perf;
  // La posición de scroll se muestrea a 10 Hz fuera de rAF: leer scrollY en cada frame forzaría
  // recálculos de estilo (falsearía la medición). Los recálculos que aún provoque este muestreo
  // se excluyen por nombre (__perfSample) en el análisis de la traza
  let y = 0;
  let vh = 0;
  setInterval(function __perfSample() { if (perf.recording) { y = window.scrollY; vh = window.innerHeight; } }, 100);
  const tick = (t) => {
    if (perf.recording) { perf.frames.push(t); perf.ys.push(y + vh / 2); }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  const observe = (type, fn, opts = {}) => {
    try { new PerformanceObserver((list) => list.getEntries().forEach(fn)).observe({ type, buffered: true, ...opts }); } catch { /* no soportado */ }
  };
  observe('long-animation-frame', (e) => {
    if (!perf.recording) return;
    perf.loaf.push({
      start: e.startTime,
      duration: e.duration,
      blocking: e.blockingDuration,
      styleLayout: e.styleAndLayoutStart ? e.startTime + e.duration - e.styleAndLayoutStart : 0,
      scripts: (e.scripts || []).map((s) => ({ src: (s.sourceURL || '').split('/').pop(), pos: s.sourceCharPosition, fn: s.sourceFunctionName, inv: s.invoker, dur: s.duration, forced: s.forcedStyleAndLayoutDuration })),
    });
  });
  observe('longtask', (e) => { if (perf.recording) perf.longtasks.push({ start: e.startTime, duration: e.duration }); });
  observe('largest-contentful-paint', (e) => {
    perf.lcp = e.startTime;
    perf.lcpEl = e.element ? `${e.element.tagName.toLowerCase()}${e.element.className && typeof e.element.className === 'string' ? '.' + e.element.className.split(' ').slice(0, 3).join('.') : ''}` : (e.url || '');
  });
  perf.shifts = [];
  observe('layout-shift', (e) => {
    if (e.hadRecentInput) return;
    perf.cls += e.value;
    const desc = (n) => (n ? `${n.tagName?.toLowerCase() || '#text'}${n.className && typeof n.className === 'string' ? '.' + n.className.split(' ').slice(0, 4).join('.') : ''}` : '?');
    perf.shifts.push({ at: Math.round(e.startTime), value: +e.value.toFixed(4), y: window.scrollY, sources: (e.sources || []).slice(0, 3).map((x) => ({ node: desc(x.node), from: [x.previousRect.y, x.previousRect.height].map(Math.round), to: [x.currentRect.y, x.currentRect.height].map(Math.round) })) });
  });
  observe('event', (e) => { if (e.interactionId) perf.events.push({ name: e.name, duration: e.duration, id: e.interactionId }); }, { durationThreshold: 16 });
}

export async function preparePage(context) {
  await context.addInitScript(instrument);
  await context.route(/^https?:\/\/(?!localhost)/, (route) => {
    const url = route.request().url();
    if (url.includes('api.dicebear.com')) return route.fulfill({ contentType: 'image/svg+xml', body: AVATAR });
    if (url.includes('res.cloudinary.com') && route.request().resourceType() === 'image') return route.fulfill({ contentType: 'image/svg+xml', body: FAVICON });
    return route.abort();
  });
}

export const startRecording = (page) => page.evaluate(() => { const p = window.__perf; p.y0 = window.scrollY; p.frames = []; p.ys = []; p.loaf = []; p.longtasks = []; p.recording = true; });
// Al parar se anotan los límites de cada <section> de la página (en px de documento) para el desglose
export const stopRecording = (page) => page.evaluate(() => {
  const p = window.__perf;
  p.recording = false;
  p.sections = [...document.querySelectorAll('main section, #root section')]
    .filter((el) => !el.parentElement.closest('section'))
    .map((el, i) => {
      const r = el.getBoundingClientRect();
      const h = el.querySelector('h1, h2');
      return { i, top: r.top + window.scrollY, bottom: r.bottom + window.scrollY, label: (h?.getAttribute('aria-label') || h?.querySelector('.sr-only')?.textContent || h?.textContent || el.className.split(' ')[0] || 'sección').trim().slice(0, 40) };
    });
  return p;
});
export const readVitals = (page) => page.evaluate(() => ({ lcp: window.__perf.lcp, lcpEl: window.__perf.lcpEl, cls: window.__perf.cls, events: window.__perf.events, shifts: window.__perf.shifts }));

const pct = (arr, p) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.max(0, Math.ceil((p / 100) * s.length) - 1))];
};
export { pct };

// Resumen de frames: un frame "perdido" es un intervalo que salta al menos un vsync (> 18 ms a 60 Hz)
export function summarizeFrames(perf) {
  const t = perf.frames;
  const d = t.slice(1).map((v, i) => v - t[i]);
  const span = t.length > 1 ? t[t.length - 1] - t[0] : 0;
  const fps = d.length ? (d.length * 1000) / span : 0;
  const p95 = pct(d, 95);
  return {
    frames: d.length,
    seconds: +(span / 1000).toFixed(2),
    fpsMean: +fps.toFixed(1),
    fpsP5: +(p95 ? 1000 / p95 : 0).toFixed(1),
    frameP95ms: +p95.toFixed(1),
    frameMaxMs: +(d.length ? Math.max(...d) : 0).toFixed(1),
    over16: d.filter((x) => x > 18).length,
    over50: d.filter((x) => x > 50).length,
    droppedPct: +((100 * d.filter((x) => x > 18).length) / Math.max(1, d.length)).toFixed(1),
    loafCount: perf.loaf.length,
    loafBlockingMs: +perf.loaf.reduce((s, l) => s + l.blocking, 0).toFixed(0),
    longTasks: perf.longtasks.length,
    longTaskMs: +perf.longtasks.reduce((s, l) => s + l.duration, 0).toFixed(0),
  };
}

// Frames perdidos por sección (según qué sección ocupa el centro de la pantalla en cada frame)
export function sectionBreakdown(perf) {
  const secs = perf.sections || [];
  const rows = secs.map((s) => ({ section: s.label, frames: 0, over16: 0, over50: 0, worstMs: 0 }));
  const other = { section: '(fuera de secciones)', frames: 0, over16: 0, over50: 0, worstMs: 0 };
  for (let i = 1; i < perf.frames.length; i += 1) {
    const d = perf.frames[i] - perf.frames[i - 1];
    const y = perf.ys[i];
    // La última sección cuyo inicio queda por encima del centro (las fijadas se solapan)
    let k = -1;
    secs.forEach((s, j) => { if (y >= s.top && y < s.bottom) k = j; });
    const r = k > -1 ? rows[k] : other;
    r.frames += 1;
    if (d > 18) r.over16 += 1;
    if (d > 50) r.over50 += 1;
    r.worstMs = Math.max(r.worstMs, Math.round(d));
  }
  return [...rows, other].filter((r) => r.frames).map((r) => ({ ...r, droppedPct: +((100 * r.over16) / r.frames).toFixed(1) }));
}

// Las funciones de script que más tiempo pasan dentro de LoAF (atribución de los tirones)
export function topLoafScripts(perf, n = 8) {
  const agg = new Map();
  perf.loaf.forEach((l) => l.scripts.forEach((s) => {
    const k = `${s.src} · ${s.fn || s.inv || '?'} @${s.pos}`;
    const a = agg.get(k) || { key: k, dur: 0, forced: 0, count: 0 };
    a.dur += s.dur; a.forced += s.forced || 0; a.count += 1;
    agg.set(k, a);
  }));
  return [...agg.values()].sort((a, b) => b.dur - a.dur).slice(0, n).map((a) => ({ ...a, dur: Math.round(a.dur), forced: Math.round(a.forced) }));
}
