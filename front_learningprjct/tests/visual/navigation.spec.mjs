// Las páginas en chunks aparte (lib/lazyRoute.js) no pueden mostrar un hueco vacío ni un spinner al
// navegar, ni siquiera si se pulsa antes de que termine su precarga (CPU 4x, Slow 4G): la página
// actual se queda hasta que llega el chunk y después se hace la transición de siempre.
import { test, expect, chromium } from '@playwright/test';
import { launchOptions } from '../perf/lib/profiles.mjs';
import { openPage } from '../perf/lib/measure.mjs';

let browser;
test.beforeAll(async () => { browser = await chromium.launch(launchOptions()); });
test.afterAll(async () => { await browser?.close(); });

for (const target of ['Contacto', 'Reseñas']) {
  test(`navegar a ${target} sin estado intermedio`, async () => {
    const { page, context, errors } = await openPage(browser, { device: 'portatil', cpu: 4, network: 'slow-4g', route: '/' });
    try {
      await page.evaluate(() => {
        window.__nav = [];
        const tick = () => {
          const main = document.querySelector('main');
          window.__nav.push({ path: location.pathname, h: main?.firstElementChild?.getBoundingClientRect().height ?? 0, spin: !!main?.querySelector('[role="status"] .animate-spin') });
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
      await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: target, exact: true }).click();
      await page.waitForTimeout(3000);
      const frames = (await page.evaluate(() => window.__nav)).filter((f) => f.path !== '/');
      expect(frames.length, 'la navegación llegó a la ruta nueva').toBeGreaterThan(30);
      expect(frames.filter((f) => f.h < 50).length, 'frames con <main> vacío').toBe(0);
      expect(frames.some((f) => f.spin), 'spinner visible').toBe(false);
      expect(errors).toEqual([]);
    } finally {
      await context.close();
    }
  });
}
