// node --test src/components/globe/journey
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  damp, dawnFrame, heroFrame, heroLeave, journeyFrame, journeyPosition, orbitFrame,
  deepSpaceFrame, HORIZON_AT, processFrame, silhouetteTop, stationWeights, stepSpring,
} from './keyframes.js';

const view = (W, H) => ({ W, H, vh: 3.2, vw: 3.2 * (W / H) });
const close = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);

test('sin secciones registradas el viaje se queda en el hero', () => {
  assert.equal(journeyPosition({ faq: null, reviews: null, cta: null }), 0);
  assert.deepEqual(stationWeights(0), [1, 0, 0, 0]);
});

test('la FAQ centrada pone la cámara en el espacio profundo', () => {
  const pos = journeyPosition({ faq: 0.5, reviews: 0, cta: 0 });
  assert.equal(pos, 1);
  assert.deepEqual(stationWeights(pos), [0, 1, 0, 0]);
});

test('a medio camino entre FAQ y reseñas los pesos se reparten a partes iguales', () => {
  const pos = journeyPosition({ faq: 1, reviews: 0.26, cta: 0 });
  close(pos, 1.5);
  const w = stationWeights(pos);
  close(w[1], 0.5); close(w[2], 0.5);
  close(w.reduce((a, b) => a + b, 0), 1);
});

test('la posición nunca pasa de la última estación (pie de página)', () => {
  assert.equal(journeyPosition({ faq: 1, reviews: 1, cta: 1 }), 3);
});

test('damp con un dt enorme (salto con ancla, pestaña dormida) llega al objetivo sin pasarse', () => {
  close(damp(0, 10, 4, 1000), 10);
  const mid = damp(0, 10, 4, 0.016);
  assert.ok(mid > 0 && mid < 10);
});

test('las estaciones escalan con el viewport (redimensionar o girar la pantalla)', () => {
  const wide = deepSpaceFrame(view(1440, 900));
  const tall = deepSpaceFrame(view(390, 844));
  close(wide.s / wide.y, tall.s / tall.y);
  assert.ok(orbitFrame(view(1440, 900)).x < 0);
});

test('el hero fijado coincide con el encaje original y se atenúa detrás de las ventajas', () => {
  const v = view(1440, 900);
  const start = heroFrame({ layout: 'side', rect: null, progress: 0 }, v);
  close(start.x, v.vw * 0.22); close(start.s, v.vh * 0.335); close(start.opacity, 1);
  close(heroFrame({ layout: 'side', rect: null, progress: 0.5 }, v).opacity, 0.5);
  assert.equal(heroLeave({ progress: 0.3 }, v), 0);
  assert.equal(heroLeave({ progress: 0.9 }, v), 1);
});

test('el horizonte cae en la parte baja de la tarjeta de la llamada final', () => {
  const v = view(1440, 900);
  const f = dawnFrame(v, { top: 200, height: 600, left: 0, width: 1000 });
  const topPx = v.H / 2 - silhouetteTop(f.y, f.s) * (v.H / v.vh);
  close(topPx, 200 + 600 * HORIZON_AT, 0.5);
});

test('entre estaciones el encaje se interpola sin saltos', () => {
  const v = view(1440, 900);
  const frames = [processFrame(v), deepSpaceFrame(v), orbitFrame(v), dawnFrame(v, null)];
  const a = journeyFrame(frames, 1.999);
  const b = journeyFrame(frames, 2.001);
  assert.ok(Math.abs(a.x - b.x) < 0.01 && Math.abs(a.s - b.s) < 0.01);
});

test('el muelle del botón se puede interrumpir y vuelve a reposo', () => {
  const s = { x: 0, v: 0 };
  for (let i = 0; i < 6; i += 1) stepSpring(s, 1, undefined, 1 / 60);
  assert.ok(s.v > 0);
  for (let i = 0; i < 240; i += 1) stepSpring(s, 0, undefined, 1 / 60);
  close(s.x, 0, 1e-3);
});
