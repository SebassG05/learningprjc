// Rutas en chunks aparte que se comportan como si fueran síncronas: si el chunk ya está cargado,
// la página se pinta directamente (sin suspender ni mostrar nada intermedio). Se precargan:
//   · en una entrada directa por URL, antes del primer render (main.jsx) y en paralelo con el
//     bundle principal (<link rel="modulepreload"> de vite/routeModulePreload.js);
//   · en un momento ocioso tras la carga y con la intención del usuario (hover, foco o toque de un enlace).
import { createElement, lazy } from 'react';

const registry = [];
let idleArmed = false;
let intentArmed = false;

export function lazyRoute(pattern, load) {
  let module = null;
  let promise = null;
  let failed = false;
  const preload = () => {
    promise ??= load().then(
      (m) => { module = m; failed = false; return m; },
      // Un fallo (red, despliegue nuevo) no se recuerda: el siguiente intento vuelve a pedirlo
      (err) => { promise = null; failed = true; throw err; },
    );
    return promise;
  };
  const Pending = lazy(preload);
  function Route(props) {
    return createElement(module ? module.default : Pending, props);
  }
  Route.preload = preload;
  registry.push({ pattern, preload, ready: () => module !== null, failed: () => failed });
  return Route;
}

// Para suspender la navegación (dentro de su transición) hasta que el chunk de destino esté listo:
// devuelve la promesa de carga, o null si no hace falta esperar. Tras un fallo no se espera: la ruta
// lo reintenta al montarse
export function routePending(pathname) {
  const route = registry.find((r) => r.pattern.test(pathname));
  if (!route || route.ready() || route.failed()) return null;
  return route.preload().catch(() => {});
}

// Precarga la ruta que corresponde a un pathname (no falla: si no carga, la ruta lo reintentará)
export function preloadPath(pathname) {
  const route = registry.find((r) => r.pattern.test(pathname));
  return route ? route.preload().catch(() => {}) : Promise.resolve();
}

// Precarga todas cuando el navegador está ocioso tras la carga (no compite con la primera pintura)
export function preloadAllWhenIdle() {
  if (idleArmed) return;
  idleArmed = true;
  const run = () => {
    const idle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 1500));
    idle(() => registry.forEach((r) => r.preload().catch(() => {})), { timeout: 4000 });
  };
  if (document.readyState === 'complete') run();
  else window.addEventListener('load', run, { once: true });
}

// Intención de navegar: un solo listener delegado para todos los enlaces internos
export function preloadOnIntent() {
  if (intentArmed) return;
  intentArmed = true;
  const onIntent = (e) => {
    const a = e.target.closest?.('a[href]');
    if (!a || a.origin !== window.location.origin) return;
    preloadPath(decodeURIComponent(a.pathname));
  };
  ['pointerover', 'focusin', 'touchstart'].forEach((type) => document.addEventListener(type, onIntent, { passive: true }));
}
