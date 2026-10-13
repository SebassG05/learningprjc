// Scroll suave con inercia (Lenis) solo para ratón/trackpad. En táctil y con reduced-motion
// el scroll es nativo. Expone utilidades para que el resto de la app no dependa de Lenis.
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

// Distancia bajo la cabecera fija al saltar a una sección
export const HEADER_OFFSET = 80;

let lenis = null;

export function startSmoothScroll() {
  if (lenis || typeof window === 'undefined') return lenis;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  if (reduce || !finePointer) return null;

  lenis = new Lenis({
    autoRaf: true,
    lerp: 0.1,
    smoothWheel: true,
    syncTouch: false,
    allowNestedScroll: true,
    stopInertiaOnNavigate: true,
    anchors: { offset: -HEADER_OFFSET },
    // Modales, menús y paneles con scroll propio no se suavizan
    prevent: (node) => !!node.closest?.('[role="dialog"], [data-lenis-prevent]'),
  });
  return lenis;
}

export function stopSmoothScroll() {
  lenis?.destroy();
  lenis = null;
}

// Salto inmediato (restauración tras cambio de ruta)
export function jumpTo(y) {
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo({ top: y, left: 0, behavior: 'instant' });
}

// Desplazamiento animado (botón subir, enlaces a secciones)
export function glideTo(target, { offset = 0 } = {}) {
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.1, easing: (t) => 1 - Math.pow(1 - t, 4) });
    return;
  }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const top = typeof target === 'number'
    ? target
    : (typeof target === 'string' ? document.querySelector(target) : target)?.getBoundingClientRect().top + window.scrollY + offset;
  if (top == null || Number.isNaN(top)) return;
  window.scrollTo({ top, behavior: reduce ? 'instant' : 'smooth' });
}

// Lleva a una sección por su hash (#id) con el desplazamiento de la cabecera
export function glideToHash(hash, { immediate = false } = {}) {
  if (!hash || hash === '#') return false;
  let el = null;
  try { el = document.querySelector(decodeURIComponent(hash)); } catch { return false; }
  if (!el) return false;
  if (immediate) {
    jumpTo(el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET);
  } else {
    glideTo(el, { offset: -HEADER_OFFSET });
  }
  return true;
}
