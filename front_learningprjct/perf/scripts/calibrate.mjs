// Calibración del entorno: cadencia de rAF en una página vacía con el mismo navegador, CPU frenada
// y recorrido. Si aquí no salen 60 fps, la diferencia no es de la web sino de la máquina de medición.
import { chromium } from '@playwright/test';
import { DEVICES, launchOptions } from '../../tests/perf/lib/profiles.mjs';
import { summarizeFrames } from '../../tests/perf/lib/page.mjs';

const b = await chromium.launch(launchOptions());
for (const device of ['portatil', 'movil']) {
  for (const cpu of [1, 4, 6]) {
    const ctx = await b.newContext(DEVICES[device].context);
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
    await page.setContent('<div style="height:6000px;background:linear-gradient(#111,#333)"></div>');
    const pending = page.evaluate(() => new Promise((res) => {
      const t = []; const end = performance.now() + 5000;
      const tick = (x) => { t.push(x); if (x < end) requestAnimationFrame(tick); else res(t); };
      requestAnimationFrame(tick);
    }));
    // Mismo patrón de rueda que el recorrido real (100 px cada 55 ms)
    await page.mouse.move(200, 300);
    for (let i = 0; i < 80; i += 1) { await page.mouse.wheel(0, 100); await page.waitForTimeout(55); }
    const frames = await pending;
    const s = summarizeFrames({ frames, loaf: [], longtasks: [] });
    console.log(`${device} cpu${cpu}: fps ${s.fpsMean} p5 ${s.fpsP5} >16.7:${s.over16}/${s.frames} p95 ${s.frameP95ms} ms`);
    await ctx.close();
  }
}
await b.close();
