// Modo ligero: en equipos que no llegan a una animación fluida se quitan los efectos más caros
// (el globo 3D se queda quieto, los fondos animados se paran y los cristales pasan a sólidos).
// Se detecta solo, midiendo los fps reales: por debajo de LOW_FPS durante 3 s seguidos (tras un
// calentamiento, para no contar la carga). La decisión se recuerda 3 días en este navegador para que
// las visitas siguientes empiecen ya ligeras; pasado ese plazo se vuelve a probar con todo.
// Solo con «Animaciones: auto» en Ajustes: con «completas» nunca se activa y con «reducidas» ya
// está todo quieto. Se refleja en <html data-lite> para el CSS (ver index.css, «Modo ligero»).
import { getMotionPreference, subscribeMotionPreference } from './motionPreference';

const KEY = 'perf-lite';
const DAYS = 3;
export const LOW_FPS = 45;

function remembered() {
  try {
    const at = Number(localStorage.getItem(KEY));
    return at > 0 && Date.now() - at < DAYS * 864e5;
  } catch {
    return false;
  }
}

let detected = typeof window === 'undefined' ? false : remembered();
const listeners = new Set();

// Activo de verdad: detectado y con la preferencia en «auto»
export const isLite = () => detected && getMotionPreference() === 'auto';

function apply() {
  if (typeof document === 'undefined') return;
  if (isLite()) document.documentElement.dataset.lite = '';
  else delete document.documentElement.dataset.lite;
}

function notify() {
  apply();
  listeners.forEach((fn) => fn());
}

export function markLite() {
  if (detected) return;
  try { localStorage.setItem(KEY, String(Date.now())); } catch { /* sin almacenamiento: solo esta visita */ }
  detected = true;
  notify();
}

export function subscribeLite(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Sonda de fps de toda la web (rAF). Cuenta segundos lentos seguidos; con la pestaña oculta no cuenta.
// Se para sola al detectar el equipo lento o si deja de hacer falta (preferencia distinta de «auto»)
let probing = false;
export function startLiteProbe() {
  if (probing || typeof window === 'undefined' || detected) return;
  probing = true;
  let frames = 0;
  let warmup = 2;
  let slow = 0;
  let raf = 0;
  const tick = () => { frames += 1; raf = requestAnimationFrame(tick); };
  raf = requestAnimationFrame(tick);
  const id = setInterval(() => {
    const fps = frames;
    frames = 0;
    if (detected || getMotionPreference() !== 'auto') {
      slow = 0;
      return;
    }
    if (document.hidden) { warmup = 1; slow = 0; return; }
    if (warmup > 0) { warmup -= 1; return; }
    slow = fps < LOW_FPS ? slow + 1 : 0;
    if (slow >= 3) {
      clearInterval(id);
      cancelAnimationFrame(raf);
      probing = false;
      markLite();
    }
  }, 1000);
}

// Al cargar el módulo (antes del primer render) y cuando cambia la preferencia o otra pestaña lo marca
if (typeof window !== 'undefined') {
  apply();
  subscribeMotionPreference(notify);
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY && e.key !== null) return;
    const next = remembered();
    if (next !== detected) { detected = next; notify(); }
  });
}
