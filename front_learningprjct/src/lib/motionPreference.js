// Preferencia de animaciones elegida en Ajustes, guardada en este navegador:
//   'auto'     → como el sistema; en equipos lentos el globo 3D se queda quieto (lo detecta solo)
//   'full'     → siempre animaciones completas (sin la detección de equipo lento)
//   'reduced'  → como «reducir movimiento» del sistema, aunque el sistema no lo pida
// Si el sistema pide reducir movimiento, se respeta en cualquier caso.
// Se refleja en <html data-motion="…"> para el CSS (ver index.css, «Animaciones reducidas»).

const KEY = 'motion-pref';
export const MOTION_VALUES = ['auto', 'full', 'reduced'];

function read() {
  try {
    const v = localStorage.getItem(KEY);
    return MOTION_VALUES.includes(v) ? v : 'auto';
  } catch {
    return 'auto';
  }
}

let current = typeof window === 'undefined' ? 'auto' : read();
const listeners = new Set();

function apply() {
  if (typeof document !== 'undefined') document.documentElement.dataset.motion = current;
}

function update(next) {
  if (next === current) return;
  current = next;
  apply();
  listeners.forEach((fn) => fn());
}

export const getMotionPreference = () => current;

export function setMotionPreference(next) {
  if (!MOTION_VALUES.includes(next)) return;
  try {
    if (next === 'auto') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, next);
  } catch { /* sin almacenamiento: vale para esta visita */ }
  update(next);
}

export function subscribeMotionPreference(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Para código fuera de React (scroll suave, efectos imperativos)
export function prefersReducedMotion() {
  if (current === 'reduced') return true;
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Al cargar el módulo (antes del primer render) y si se cambia en otra pestaña
if (typeof window !== 'undefined') {
  apply();
  window.addEventListener('storage', (e) => { if (e.key === KEY || e.key === null) update(read()); });
}
