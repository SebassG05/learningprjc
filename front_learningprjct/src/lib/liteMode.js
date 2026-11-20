// Modo ligero: en equipos que no llegan a una animación fluida se quitan los efectos más caros
// (el globo 3D se queda quieto, los fondos animados se paran y los cristales pasan a sólidos).
// Se detecta solo, midiendo los fps reales: 3 segundos por debajo de LOW_FPS dentro de los últimos 8
// (tras un calentamiento, para no contar la carga). No hace falta que sean seguidos: en el móvil los
// tirones llegan a ráfagas de 1-2 s con cada gesto de scroll, y en reposo puede ir bien. La decisión se recuerda 3 días en este navegador para que
// las visitas siguientes empiecen ya ligeras; pasado ese plazo se vuelve a probar con todo.
// Solo con «Animaciones: auto» en Ajustes: con «completas» nunca se activa y con «reducidas» ya
// está todo quieto. Se refleja en <html data-lite> para el CSS (ver index.css, «Modo ligero»).
import { getMotionPreference, subscribeMotionPreference } from './motionPreference';

const KEY = 'perf-lite';
const DAYS = 3;
export const LOW_FPS = 45;
const WINDOW = 8;
const SLOW_SECONDS = 3;

// Contador de segundos lentos en una ventana móvil: devuelve true cuando el equipo no da la talla
export function slowSeconds() {
  const last = [];
  return (fps) => {
    last.push(fps < LOW_FPS);
    if (last.length > WINDOW) last.shift();
    return last.filter(Boolean).length >= SLOW_SECONDS;
  };
}

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
  let slow = slowSeconds();
  let raf = 0;
  const tick = () => { frames += 1; raf = requestAnimationFrame(tick); };
  raf = requestAnimationFrame(tick);
  const id = setInterval(() => {
    const fps = frames;
    frames = 0;
    if (detected || getMotionPreference() !== 'auto') {
      slow = slowSeconds();
      return;
    }
    if (document.hidden) { warmup = 1; slow = slowSeconds(); return; }
    if (warmup > 0) { warmup -= 1; return; }
    if (slow(fps)) {
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
