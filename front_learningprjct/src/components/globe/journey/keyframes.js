// Trayectoria del viaje "de vuelta a la Tierra" (funciones puras, sin three ni React).
// Unidades de mundo en el plano z = 0 de la cámara; vw × vh es el tamaño visible del viewport.
// Estaciones en orden de scroll: 0 hero/proceso → 1 FAQ (espacio profundo) → 2 reseñas (órbita)
// → 3 llamada final (horizonte al amanecer).

export const clamp01 = (v) => Math.min(1, Math.max(0, v));
export const smooth = (t) => t * t * (3 - 2 * t);
export const ramp = (v, a, b) => clamp01((v - a) / (b - a));
export const lerp = (a, b, t) => a + (b - a) * t;

// Tramo del progreso de cada sección ('start end' → 'end start') en el que la cámara llega a ella
export const ARRIVAL = [0.1, 0.42];
export const CAMERA_Z = 6;
// Altura del horizonte dentro de la tarjeta de la llamada final (fracción desde arriba)
export const HORIZON_AT = 0.93;
export const STATION_COUNT = 4;

// Encaje del globo en un rectángulo de aw × ah, relativo a su centro
export function fit(layout, aw, ah) {
  if (layout === 'center') return { x: 0, y: 0, s: Math.min(aw, ah) * 0.27 };
  // Pantallas casi cuadradas o verticales: el globo asoma abajo a la derecha, lejos del texto
  if (aw / ah < 1.2) return { x: aw * 0.3, y: -ah * 0.24, s: aw * 0.28 };
  return { x: aw * 0.22, y: ah * 0.01, s: ah * 0.335 };
}

// Rectángulo en píxeles de pantalla → centro y tamaño en mundo
export function rectToWorld(rect, view) {
  const k = view.vh / view.H;
  return {
    cx: (rect.left + rect.width / 2 - view.W / 2) * k,
    cy: (view.H / 2 - rect.top - rect.height / 2) * k,
    w: rect.width * k,
    h: rect.height * k,
  };
}

export const pxToWorld = (x, y, view) => {
  const k = view.vh / view.H;
  return [(x - view.W / 2) * k, (view.H / 2 - y) * k];
};

const base = { tilt: 0, opacity: 1, starsY: 0, starFade: 1, dawn: 0 };

// Hero: el globo encajado en su ancla; con escena fijada, acercamiento y subida según el progreso
export function heroFrame({ layout, rect, progress }, view) {
  const r = rect ? rectToWorld(rect, view) : { cx: 0, cy: 0, w: view.vw, h: view.vh };
  const { x, y, s } = fit(layout, r.w, r.h);
  const p = progress ?? 0;
  const a = smooth(clamp01(p / 0.32));
  const b = smooth(clamp01((p - 0.32) / 0.3));
  return {
    ...base,
    x: r.cx + x * (1 - 0.55 * a),
    y: r.cy + y - r.h * 0.04 * a + r.h * 0.12 * b,
    s: s * (1 + 0.2 * a + 0.22 * b),
    // Detrás de las ventajas el globo queda a media luz (legibilidad)
    opacity: 1 - 0.5 * ramp(p, 0.26, 0.42),
  };
}

// Cuánto se ha ido ya el hero: por progreso de la escena fijada o por la posición de su ancla
export function heroLeave({ progress, rect }, view) {
  if (progress != null) return smooth(ramp(progress, 0.6, 0.86));
  if (!rect) return 0;
  return smooth(clamp01(1 - (rect.top + rect.height) / (view.H * 0.5)));
}

// Proceso: transición neutra, el globo se aleja arriba a la derecha y queda a media luz
export function processFrame({ vw, vh }) {
  return { ...base, x: vw * 0.4, y: vh * 0.27, s: vh * 0.12, opacity: 0.45, starsY: 0.12 };
}

// FAQ, espacio profundo: el globo sale de plano por abajo (solo asoma su halo), la cámara sube
export function deepSpaceFrame({ vw, vh }) {
  const s = vh * 0.3;
  return { ...base, x: vw * 0.3, y: -vh * 0.5 - s * 1.25, s, starsY: 0.45 };
}

// Reseñas, la órbita: el globo asoma abajo a la izquierda, la órbita ocupa el centro
export function orbitFrame({ vw, vh }) {
  // En vertical el globo no debe tapar media pantalla
  const s = Math.min(vh * 0.36, vw * 0.5);
  return { ...base, x: -vw * 0.38, y: -vh * 0.5 - s * 0.45, s, starsY: 0.75 };
}

// Altura en pantalla (plano z = 0) del borde superior de una esfera de radio r centrada en (0, cy, 0)
// vista desde la cámara: con perspectiva, la silueta queda por encima de cy + r
export function silhouetteTop(cy, r) {
  const d = Math.hypot(cy, CAMERA_Z);
  return CAMERA_Z * Math.tan(Math.atan(cy / CAMERA_Z) + Math.asin(Math.min(1, r / d)));
}

// Centro que deja la silueta superior a la altura `top` (bisección: la silueta sube con cy)
export function centerForHorizon(top, r) {
  let lo = top - r * 3;
  let hi = top - r * 0.5;
  for (let i = 0; i < 40; i += 1) {
    const mid = (lo + hi) / 2;
    if (silhouetteTop(mid, r) > top) hi = mid; else lo = mid;
  }
  return (lo + hi) / 2;
}

// Llamada final, horizonte: un globo enorme cuyo borde superior cae en la parte baja de la tarjeta;
// inclinado para que la franja visible sea de latitudes medias (~40° N) y no el Ártico
export function dawnFrame(view, horizonRect) {
  const { vw, vh } = view;
  const s = Math.max(vw * 1.1, vh * 1.4);
  let top = -vh * 0.32;
  if (horizonRect) {
    const k = vh / view.H;
    top = (view.H / 2 - (horizonRect.top + horizonRect.height * HORIZON_AT)) * k;
  }
  // Si la tarjeta aún está muy lejos, el globo espera justo bajo la pantalla
  top = Math.max(top, -vh * 0.75);
  return { ...base, x: 0, y: centerForHorizon(top, s), s, tilt: -0.5, starsY: 1, starFade: 0.3, dawn: 1 };
}

// Posición continua en la trayectoria (0…3) a partir del progreso de cada sección
export function journeyPosition({ faq, reviews, cta }) {
  const arrive = (p) => (p == null ? 0 : ramp(p, ARRIVAL[0], ARRIVAL[1]));
  return Math.min(STATION_COUNT - 1, arrive(faq) + arrive(reviews) + arrive(cta));
}

// Peso de cada estación (para el fundido de las escenas): suma 1
export function stationWeights(position) {
  return Array.from({ length: STATION_COUNT }, (_, i) => Math.max(0, 1 - Math.abs(position - i)));
}

export const FRAME_KEYS = ['x', 'y', 's', 'tilt', 'opacity', 'starsY', 'starFade', 'dawn'];

export function blendFrames(a, b, t) {
  const out = {};
  FRAME_KEYS.forEach((k) => { out[k] = lerp(a[k], b[k], t); });
  return out;
}

// Encaje objetivo a partir de las cuatro estaciones y la posición
export function journeyFrame(frames, position) {
  const i = Math.min(STATION_COUNT - 2, Math.floor(position));
  return blendFrames(frames[i], frames[i + 1], smooth(clamp01(position - i)));
}

// Amortiguación exponencial independiente de los fps; nunca se pasa del objetivo
export const damp = (current, target, lambda, dt) => target + (current - target) * Math.exp(-lambda * dt);

export function dampFrame(current, target, lambda, dt) {
  FRAME_KEYS.forEach((k) => { current[k] = damp(current[k], target[k], lambda, dt); });
  return current;
}

// Seguimiento del encaje: los pasos pequeños del objetivo (scroll normal, el ancla del hero que se
// desplaza) se siguen al momento, sin retraso; los saltos (anclas, glideTo, scroll muy rápido) se
// amortiguan, así el globo nunca aparece de golpe en otro sitio
export const TRAVEL_LAMBDA = 4.5;
const STEP_LIMIT = { x: 0.03, y: 0.03, s: 0.03 }; // fracción de vh; el resto (0…1) usa 0.05

export function followFrame(current, target, previous, vh, dt) {
  FRAME_KEYS.forEach((k) => {
    const step = target[k] - previous[k];
    const limit = STEP_LIMIT[k] ? STEP_LIMIT[k] * vh : 0.05;
    const carry = Math.abs(step) < limit ? step : 0;
    current[k] = damp(current[k] + carry, target[k], TRAVEL_LAMBDA, dt);
  });
  return current;
}

// Muelle amortiguado (interrumpible: conserva la velocidad al cambiar de objetivo)
export function stepSpring(state, target, { stiffness = 170, damping = 26 } = {}, dt = 1 / 60) {
  let left = Math.min(dt, 0.1);
  while (left > 0) {
    const h = Math.min(left, 1 / 120);
    const accel = stiffness * (target - state.x) - damping * state.v;
    state.v += accel * h;
    state.x += state.v * h;
    left -= h;
  }
  return state;
}
