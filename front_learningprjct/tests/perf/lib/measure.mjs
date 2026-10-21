// Medición de una ruta con un dispositivo emulado: carga (LCP/CLS), recorrido de scroll completo
// (fps, frames perdidos, LoAF, main thread, layouts y estilos, GPU) e interacción (INP aproximado).
import { DEVICES, NETWORK, BASE_URL } from './profiles.mjs';
import { preparePage, readVitals, sectionBreakdown, startRecording, stopRecording, summarizeFrames, topLoafScripts, pct } from './page.mjs';

const TRACE_CATEGORIES = [
  'toplevel', 'devtools.timeline', 'disabled-by-default-devtools.timeline',
  'disabled-by-default-devtools.timeline.frame', 'gpu', 'viz',
];
const JS_EVENTS = new Set(['FunctionCall', 'EvaluateScript', 'TimerFire', 'FireAnimationFrame', 'EventDispatch', 'v8.compile', 'RunMicrotasks', 'V8.Execute']);
const TASK_EVENTS = new Set(['ThreadControllerImpl::RunTask', 'RunTask']);

// Suma de intervalos sin contar dos veces los solapados
function unionMs(intervals) {
  const s = intervals.sort((a, b) => a[0] - b[0]);
  let total = 0; let end = -Infinity;
  for (const [a, b] of s) {
    if (b <= end) continue;
    total += b - Math.max(a, end);
    end = b;
  }
  return total / 1000;
}

export function analyzeTrace(json) {
  const events = (JSON.parse(json).traceEvents || []);
  const threadName = new Map();
  events.forEach((e) => { if (e.ph === 'M' && e.name === 'thread_name') threadName.set(`${e.pid}:${e.tid}`, e.args?.name); });
  const byThread = new Map();
  events.forEach((e) => {
    if (e.ph !== 'X' || typeof e.dur !== 'number') return;
    const k = `${e.pid}:${e.tid}`;
    if (!byThread.has(k)) byThread.set(k, []);
    byThread.get(k).push(e);
  });
  const busy = (k) => unionMs((byThread.get(k) || []).filter((e) => TASK_EVENTS.has(e.name)).map((e) => [e.ts, e.ts + e.dur]));
  const threads = [...byThread.keys()];
  const mains = threads.filter((k) => threadName.get(k) === 'CrRendererMain');
  const main = mains.sort((a, b) => busy(b) - busy(a))[0];
  const gpuThreads = threads.filter((k) => threadName.get(k) === 'CrGpuMain');
  const vizThreads = threads.filter((k) => threadName.get(k) === 'VizCompositorThread');

  const ev = (byThread.get(main) || []).sort((a, b) => a.ts - b.ts || b.dur - a.dur);
  const span = ev.length ? (ev[ev.length - 1].ts + ev[ev.length - 1].dur - ev[0].ts) / 1e6 : 0;
  // Pila por anidamiento temporal para saber si un layout ocurre dentro de JS (forzado)
  const stack = [];
  const culprits = new Map();
  const blame = (ms) => {
    const js = [...stack].reverse().find((x) => x.name === 'FunctionCall' || x.name === 'FireAnimationFrame' || x.name === 'EventDispatch' || x.name === 'TimerFire');
    const d = js?.args?.data || {};
    const k = d.functionName || d.url ? `${(d.url || '').split('/').pop()}:${d.functionName || '?'}:${d.lineNumber ?? ''}:${d.columnNumber ?? ''}` : (js?.name || '?');
    const c = culprits.get(k) || { fn: k, count: 0, ms: 0 };
    c.count += 1; c.ms += ms;
    culprits.set(k, c);
  };
  const out = { layout: 0, layoutMs: 0, style: 0, styleMs: 0, forcedLayout: 0, forcedStyle: 0, forcedMs: 0, paint: 0, paintMs: 0, scriptMs: 0, gcMs: 0 };
  for (const e of ev) {
    while (stack.length && stack[stack.length - 1].ts + stack[stack.length - 1].dur <= e.ts) stack.pop();
    const inJs = stack.some((s) => JS_EVENTS.has(s.name));
    const ms = e.dur / 1000;
    // Lo que fuerza el propio muestreo de la medición no cuenta
    const own = inJs && stack.some((x) => x.args?.data?.functionName === '__perfSample');
    if (own) { stack.push(e); continue; }
    if (e.name === 'Layout') { out.layout += 1; out.layoutMs += ms; if (inJs) { out.forcedLayout += 1; out.forcedMs += ms; blame(ms); } }
    if (e.name === 'UpdateLayoutTree' || e.name === 'RecalculateStyles') { out.style += 1; out.styleMs += ms; if (inJs) { out.forcedStyle += 1; out.forcedMs += ms; blame(ms); } }
    if (e.name === 'Paint') { out.paint += 1; out.paintMs += ms; }
    if ((e.name === 'FunctionCall' || e.name === 'EvaluateScript' || e.name === 'FireAnimationFrame' || e.name === 'TimerFire' || e.name === 'EventDispatch') && !inJs) out.scriptMs += ms;
    if (e.name === 'MinorGC' || e.name === 'MajorGC' || e.name === 'V8.GC_SCAVENGER' || e.name === 'BlinkGC.AtomicPhase') out.gcMs += ms;
    stack.push(e);
  }
  const perSec = (v) => +(span ? v / span : 0).toFixed(1);
  const mainBusy = busy(main);
  const gpuBusy = gpuThreads.reduce((s, k) => s + busy(k), 0);
  const vizBusy = vizThreads.reduce((s, k) => s + busy(k), 0);
  return {
    traceSeconds: +span.toFixed(2),
    mainBusyMs: Math.round(mainBusy),
    mainBusyPct: +(span ? (100 * mainBusy) / (span * 1000) : 0).toFixed(1),
    scriptMs: Math.round(out.scriptMs),
    layouts: out.layout, layoutMs: Math.round(out.layoutMs), layoutsPerSec: perSec(out.layout),
    styleRecalcs: out.style, styleMs: Math.round(out.styleMs), styleRecalcsPerSec: perSec(out.style),
    forcedLayouts: out.forcedLayout, forcedStyles: out.forcedStyle, forcedMs: Math.round(out.forcedMs),
    paints: out.paint, paintMs: Math.round(out.paintMs),
    gcMs: Math.round(out.gcMs),
    gpuBusyPct: +(span ? (100 * gpuBusy) / (span * 1000) : 0).toFixed(1),
    vizBusyPct: +(span ? (100 * vizBusy) / (span * 1000) : 0).toFixed(1),
    forcedBy: [...culprits.values()].sort((a, b) => b.ms - a.ms).slice(0, 6).map((c) => ({ ...c, ms: Math.round(c.ms) })),
  };
}

async function maxScroll(page) {
  return page.evaluate(() => document.scrollingElement.scrollHeight - window.innerHeight);
}

// Recorrido de arriba abajo a ~1800 px/s. Ratón: rueda (la consume Lenis); táctil: gesto real del compositor
export async function scrollJourney(page, cdp, { touch, direction = 'down' }) {
  const vp = page.viewportSize();
  const sign = direction === 'down' ? 1 : -1;
  const done = async () => {
    const [y, max] = await page.evaluate(() => [window.scrollY, document.scrollingElement.scrollHeight - window.innerHeight]);
    return direction === 'down' ? y >= max - 4 : y <= 4;
  };
  const deadline = Date.now() + 60_000;
  if (touch) {
    // Arrastres de medio viewport en ~200 ms con eventos táctiles crudos (synthesizeScrollGesture
    // táctil no desplaza en headless). Tras soltar, el navegador aplica su propia inercia (fling)
    const x = Math.round(vp.width / 2);
    const y0 = Math.round(vp.height * (sign > 0 ? 0.75 : 0.25));
    const dist = Math.round(vp.height * 0.5);
    const STEPS = 12;
    while (!(await done()) && Date.now() < deadline) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0 }] });
      for (let i = 1; i <= STEPS; i += 1) {
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 - sign * (dist * i) / STEPS }] });
        await page.waitForTimeout(16);
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForTimeout(120);
    }
  } else {
    await page.mouse.move(vp.width / 2, vp.height / 2);
    while (!(await done()) && Date.now() < deadline) {
      await page.mouse.wheel(0, sign * 100);
      await page.waitForTimeout(55);
    }
  }
  await page.waitForTimeout(1200); // inercia de Lenis y muelles de las escenas
}

export async function openPage(browser, opts) {
  const { device, cpu, network, route = '/' } = opts;
  const dev = DEVICES[device];
  const context = await browser.newContext({ ...dev.context, serviceWorkers: 'block', reducedMotion: 'no-preference' });
  await preparePage(context);
  // Solo diagnóstico: bloquear recursos (p. ej. el chunk del globo) para medir la página sin ellos
  if (opts.block) await context.route(new RegExp(opts.block), (r) => r.abort());
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error' && !/net::ERR_FAILED|Failed to load resource/.test(m.text())) errors.push(m.text()); });
  const cdp = await context.newCDPSession(page);
  if (cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
  const net = NETWORK[network];
  if (net) {
    await cdp.send('Network.enable');
    await cdp.send('Network.emulateNetworkConditions', net);
  }
  await page.goto(BASE_URL + route, { waitUntil: 'load', timeout: 120_000 });
  // Solo diagnóstico: CSS inyectado para aislar el coste de una capa (p. ej. ocultar el lienzo)
  if (opts.css) await page.addStyleTag({ content: opts.css });
  return { context, page, cdp, errors, dev };
}

// Calibración: cadencia de rAF en una página vacía con el mismo dispositivo y CPU. Por debajo de
// ~59 fps la máquina de medición está ocupada y la ejecución no es válida
export async function envFps(browser, { device, cpu }) {
  const ctx = await browser.newContext(DEVICES[device].context);
  try {
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    if (cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
    await page.setContent('<div style="height:4000px"></div>');
    const t = await page.evaluate(() => new Promise((res) => {
      const f = []; const end = performance.now() + 2000;
      const tick = (x) => { f.push(x); if (x < end) requestAnimationFrame(tick); else res(f); };
      requestAnimationFrame(tick);
    }));
    return +(((t.length - 1) * 1000) / (t[t.length - 1] - t[0])).toFixed(1);
  } finally {
    await ctx.close();
  }
}

// Carga + recorrido + interacción. Devuelve un objeto plano listo para JSON
export async function measureRoute(browser, opts) {
  const { device, route = '/' } = opts;
  const { context, page, cdp, errors, dev } = await openPage(browser, opts);
  try {
    // Asentado tras la carga: el lienzo 3D de escritorio llega tras load + idle
    await page.waitForTimeout(4000);
    if (route === '/' && !dev.touch) await page.waitForSelector('canvas', { timeout: 20_000 }).catch(() => {});
    await page.waitForTimeout(1500);
    const vitalsLoad = await readVitals(page);

    await browser.startTracing(page, { categories: TRACE_CATEGORIES });
    await startRecording(page);
    await scrollJourney(page, cdp, { touch: dev.touch, direction: 'down' });
    const perf = await stopRecording(page);
    const trace = analyzeTrace((await browser.stopTracing()).toString());

    // Interacción: abrir y cerrar preguntas de la FAQ (pulso del fondo + animación de layout)
    let inp = null;
    if (route === '/') {
      const q = page.locator('button[aria-controls^="faq-answer-"]');
      const n = Math.min(3, await q.count());
      for (let i = 0; i < n; i += 1) {
        await q.nth(i).scrollIntoViewIfNeeded();
        if (dev.touch) await q.nth(i).tap(); else await q.nth(i).click();
        await page.waitForTimeout(700);
      }
      const { events } = await readVitals(page);
      const byId = new Map();
      events.forEach((e) => byId.set(e.id, Math.max(byId.get(e.id) || 0, e.duration)));
      const durs = [...byId.values()];
      inp = durs.length ? Math.max(...durs) : 0;
    }
    const vitals = await readVitals(page);
    return {
      device, cpu: opts.cpu, network: opts.network, route,
      pageHeight: await maxScroll(page),
      lcpMs: Math.round(vitalsLoad.lcp), lcpElement: vitalsLoad.lcpEl,
      cls: +vitals.cls.toFixed(4),
      shifts: vitals.shifts.filter((x) => x.value > 0.001).slice(0, 8),
      inpMs: inp,
      ...summarizeFrames(perf),
      frameP99ms: +pct(perf.frames.slice(1).map((v, i) => v - perf.frames[i]), 99).toFixed(1),
      trace,
      sections: sectionBreakdown(perf),
      loafTop: topLoafScripts(perf),
      errors,
    };
  } finally {
    await context.close();
  }
}

// Fugas: heap y contadores del DOM tras un GC, al inicio y tras `seconds` de scroll continuo arriba/abajo
export async function measureMemory(browser, { device, cpu = 4, seconds = 120, route = '/' }) {
  const { context, page, cdp, errors, dev } = await openPage(browser, { device, cpu, network: 'none', route });
  const snap = async () => {
    await cdp.send('HeapProfiler.enable');
    await cdp.send('HeapProfiler.collectGarbage');
    const heap = await cdp.send('Runtime.getHeapUsage');
    const dom = await cdp.send('Memory.getDOMCounters');
    return { heapMB: +(heap.usedSize / 1048576).toFixed(2), nodes: dom.nodes, listeners: dom.jsEventListeners, documents: dom.documents };
  };
  try {
    await page.waitForTimeout(4000);
    if (!dev.touch) await page.waitForSelector('canvas', { timeout: 20_000 }).catch(() => {});
    // Una pasada completa primero: así las escenas 3D ya están montadas en la foto inicial
    await scrollJourney(page, cdp, { touch: dev.touch, direction: 'down' });
    await scrollJourney(page, cdp, { touch: dev.touch, direction: 'up' });
    const start = await snap();
    const until = Date.now() + seconds * 1000;
    let passes = 0;
    while (Date.now() < until) {
      await scrollJourney(page, cdp, { touch: dev.touch, direction: passes % 2 ? 'up' : 'down' });
      passes += 1;
    }
    const end = await snap();
    return { device, cpu, seconds, passes, start, end, heapGrowthMB: +(end.heapMB - start.heapMB).toFixed(2), nodeGrowth: end.nodes - start.nodes, listenerGrowth: end.listeners - start.listeners, errors };
  } finally {
    await context.close();
  }
}
