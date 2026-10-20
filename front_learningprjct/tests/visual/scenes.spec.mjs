// Regresión visual: cada escena de la home y las páginas públicas principales en 4 anchos.
// El reloj de la página es falso y está parado (requestAnimationFrame, performance.now, timers):
// el globo, los muelles de las escenas y Lenis solo avanzan con clock.runFor, así cada captura
// sale idéntica entre ejecuciones. Las capturas de referencia están en __screenshots__/.
import { test, expect } from '@playwright/test';
import { preparePage } from '../perf/lib/page.mjs';

const WIDTHS = [
  { name: '360', viewport: { width: 360, height: 780 }, touch: true },
  { name: '768', viewport: { width: 768, height: 1024 }, touch: true },
  { name: '1280', viewport: { width: 1280, height: 800 }, touch: false },
  { name: '1920', viewport: { width: 1920, height: 1080 }, touch: false },
];

const START = new Date('2026-10-20T10:00:00Z');

// Deja correr el reloj falso a pasos (los observadores y cargas reales se intercalan)
async function settle(page, ms = 3000) {
  for (let t = 0; t < ms; t += 500) {
    await page.clock.runFor(500);
    await page.waitForTimeout(40);
  }
}

async function open(page, url, { touch }) {
  // install() solo controla el reloj; pauseAt() antes de navegar hace que la página arranque congelada
  await page.clock.install({ time: START });
  await page.clock.pauseAt(new Date(START.getTime() + 1000));
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await settle(page, 2000);
}

// Las animaciones SMIL de SVG (<animateMotion>) llevan su propio reloj: ni el reloj falso ni
// animations:'disabled' las paran. Se congelan en t=0 justo antes de cada captura (solo en el test)
async function freezeSvg(page) {
  await page.evaluate(() => document.querySelectorAll('svg').forEach((svg) => {
    if (svg.ownerSVGElement) return;
    svg.pauseAnimations?.();
    svg.setCurrentTime?.(0);
  }));
}

// Una pasada de arriba abajo antes de medir posiciones: las secciones con content-visibility:auto
// se pintan una vez y fijan su altura real, así los puntos de control no dependen del momento
async function prime(page) {
  const max = await page.evaluate(() => document.scrollingElement.scrollHeight - window.innerHeight);
  for (let y = 0; y <= max + 400; y += 400) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
    await page.clock.runFor(100);
    await page.waitForTimeout(30);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await settle(page, 1500);
}

// Fondo 3D de la home: en táctil se carga con la primera interacción. El reloj falso avanza a pasos
// cortos solo hasta que GlobeStage pide el lienzo (aparece su contenedor fijo); después se espera en
// tiempo real a que llegue el chunk y se cree el lienzo SIN avanzar el reloj. Así el globo arranca
// siempre en el mismo instante falso y acumula los mismos frames de giro en cada ejecución
async function waitForGlobe(page, { touch }) {
  if (touch) await page.evaluate(() => window.dispatchEvent(new Event('pointerdown')));
  const wrapper = 'div.fixed.-z-10.h-lvh';
  for (let i = 0; i < 100 && !(await page.$(wrapper)); i += 1) {
    await page.clock.runFor(100);
    await page.waitForTimeout(20);
  }
  await page.waitForSelector(`${wrapper} canvas`, { timeout: 30_000 });
  await page.waitForTimeout(800);
  await settle(page, 4000);
}

// framer-motion lanza parte de sus entradas como Web Animations y fija su startTime con
// performance.now() (reloj falso), pero la línea de tiempo del documento sigue el tiempo real: su
// progreso dependería de cuánto tiempo real haya pasado. Se llevan a su estado final (el mismo que
// ve el usuario al terminar) y se deja un paso de reloj para que framer aplique sus valores finales
async function finishAnimations(page) {
  await page.evaluate(() => document.getAnimations().forEach((a) => {
    const end = a.effect?.getComputedTiming?.().endTime;
    if (a.playState === 'running' && Number.isFinite(end)) a.finish();
  }));
  await settle(page, 500);
}

// Puntos de control de la home a partir de sus secciones (las fijadas se capturan a mitad de escena)
const HOME_CHECKPOINTS = () => {
  const vh = window.innerHeight;
  const secs = [...document.querySelectorAll('main section')].filter((s) => !s.parentElement.closest('section'));
  const box = (el) => { const r = el.getBoundingClientRect(); return { top: r.top + window.scrollY, h: r.height }; };
  const byHeading = (text) => secs.find((s) => s.querySelector('h1, h2')?.textContent.includes(text));
  const max = document.scrollingElement.scrollHeight - vh;
  const hero = box(secs[0]);
  const pinned = hero.h > vh * 1.5;
  const points = { 'hero': 0 };
  if (pinned) {
    points['hero-ventajas'] = hero.top + 0.45 * (hero.h - vh);
    const proc = box(byHeading('¿Cómo funciona'));
    points['proceso'] = proc.top + 0.45 * (proc.h - vh);
  } else {
    points['ventajas'] = box(byHeading('¿Qué puedes esperar')).top;
    points['proceso'] = box(byHeading('¿Cómo funciona')).top;
  }
  points['faq'] = box(byHeading('Preguntas frecuentes')).top + (pinned ? vh * 0.35 : 0);
  points['resenas'] = box(byHeading('¿Qué opinan')).top;
  const cta = box(byHeading('¿Listo para'));
  points['cta'] = cta.top + (cta.h - vh) / 2;
  points['pie'] = max;
  return Object.fromEntries(Object.entries(points).map(([k, v]) => [k, Math.max(0, Math.min(max, Math.round(v)))]));
};

for (const w of WIDTHS) {
  test.describe(`${w.name}px`, () => {
    test.use({ viewport: w.viewport, hasTouch: w.touch, isMobile: w.touch && w.viewport.width < 600 });

    test(`home: escenas @${w.name}`, async ({ page, context }) => {
      await preparePage(context);
      await open(page, '/', w);
      await waitForGlobe(page, w);
      await prime(page);
      const points = await page.evaluate(HOME_CHECKPOINTS);
      for (const [name, y] of Object.entries(points)) {
        await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
        await settle(page, 1500);
        await page.waitForTimeout(300); // montaje de escenas 3D cercanas (IntersectionObserver)
        await settle(page, 2500);
        await finishAnimations(page);
        await freezeSvg(page);
        await expect(page, `escena ${name}`).toHaveScreenshot(`home-${name}-${w.name}.png`);
      }
    });

    for (const route of ['/cursos', '/sobre', '/contacto', '/reseñas']) {
      test(`${route} @${w.name}`, async ({ page, context }) => {
        await preparePage(context);
        await open(page, route, w);
        await settle(page, 3000);
        await prime(page);
        const max = await page.evaluate(() => document.scrollingElement.scrollHeight - window.innerHeight);
        const slug = route.slice(1).normalize('NFD').replace(/[^\w]/g, '');
        for (const [name, y] of [['arriba', 0], ['medio', Math.round(max / 2)], ['abajo', max]]) {
          await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
          await settle(page, 2500);
          await finishAnimations(page);
          await freezeSvg(page);
          await expect(page, `${route} ${name}`).toHaveScreenshot(`${slug}-${name}-${w.name}.png`);
        }
      });
    }
  });
}
