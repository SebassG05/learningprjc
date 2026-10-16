/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Contenedor modal del acceso: velo, tarjeta con role="dialog", foco atrapado,
// Escape, fondo inerte, bloqueo de scroll sin salto y vuelta del foco al cerrar. No sabe nada de
// autenticación: solo abre, cierra y avisa al lienzo del viaje (journey.overlay).
import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useDragControls, useReducedMotion } from 'framer-motion';
import { duration, ease, overlay, spring } from '../../lib/motion';
import useMediaQuery from '../../hooks/useMediaQuery';
import { shouldDismissSheet } from './validation';
import { setOverlay } from '../globe/journey/store';
import { inertOutside as inertOutsideKeeping } from '../../lib/modalLock';

const AuthGlobe = lazy(() => import('../globe/AuthGlobe'));

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const isVisible = (el) => el.getClientRects().length > 0;
// Un iframe solo cuenta si se ve (el botón personalizado de Google lo es; su iframe auxiliar mide 0)
const isTabStop = (el) => (el.tagName === 'IFRAME' ? el.offsetWidth > 0 && el.offsetHeight > 0 : isVisible(el));
const canReceiveFocus = (el) =>
  !!el && el !== document.body && el.isConnected && isVisible(el) && !el.closest('[inert]');

// Lo que debe seguir operativo bajo el diálogo: el banner de cookies (otro diálogo) y los avisos
// (y el propio velo del acceso: sus centinelas de foco no pueden quedar inertes)
const KEEP = '[data-auth-overlay], [role="dialog"], [role="alertdialog"], [role="status"], [aria-live]';
const inertOutside = (node, out) => inertOutsideKeeping(node, KEEP, out);

// "Ventana al planeta" (escritorio): la página se desvanece salvo el lienzo del viaje, que queda
// a la vista sin desenfoque. Solo opacidad (WAAPI, compositor); se deshace a la inversa al cerrar.
function fadeStage(node, out, reduce) {
  for (const child of node.children) {
    if (child.matches(KEEP)) continue;
    if (child.querySelector('canvas, ' + KEEP)) fadeStage(child, out, reduce);
    else if (!child.querySelector('canvas') && child.tagName !== 'CANVAS') {
      out.push(child.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: reduce ? 120 : 320, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards',
      }));
    }
  }
  return out;
}

// Fondo inerte + scroll bloqueado mientras el diálogo está abierto. Devuelve cómo deshacerlo.
function lockPage() {
  const root = document.getElementById('root');
  const inerted = root ? inertOutside(root, []) : [];
  const stage = root && window.matchMedia('(min-width: 640px)').matches
    ? fadeStage(root, [], window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    : [];

  const html = document.documentElement;
  const prev = { overflow: html.style.overflow, gutter: html.style.scrollbarGutter };
  // Reserva el hueco de la barra solo si la había: sin salto en páginas largas ni en las cortas
  const hadScrollbar = window.innerWidth > html.clientWidth;
  html.style.overflow = 'hidden';
  if (hadScrollbar) html.style.scrollbarGutter = 'stable';
  setOverlay(true);

  return () => {
    inerted.forEach((el) => { el.inert = false; });
    stage.forEach((a) => { a.onfinish = () => a.cancel(); a.reverse(); });
    html.style.overflow = prev.overflow;
    html.style.scrollbarGutter = prev.gutter;
    setOverlay(false);
  };
}

// Devuelve el foco a quien abrió el diálogo; si ya no existe (p. ej. /login), al botón "Acceder"
// de la cabecera y, en último caso, al contenido principal
function restoreFocus(opener) {
  const target = [opener, document.querySelector('[data-auth-trigger]')].find(canReceiveFocus);
  if (target) {
    target.focus({ preventScroll: true });
    return;
  }
  const main = document.querySelector('main');
  if (!main) return;
  if (!main.hasAttribute('tabindex')) {
    main.setAttribute('tabindex', '-1');
    main.addEventListener('blur', () => main.removeAttribute('tabindex'), { once: true });
  }
  main.focus({ preventScroll: true });
}

// Aparición del panel. Escritorio: entra desde la izquierda, como una consola junto al planeta.
// Móvil: la hoja sube un poco. Reduced motion: solo opacidad, corta.
const console_ = {
  initial: { opacity: 0, x: -24 },
  animate: { opacity: 1, x: 0, transition: spring.gentle },
  exit: { opacity: 0, x: -16, transition: { duration: duration.fast, ease: ease.exit } },
};
const sheet = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.outExpo } },
  exit: { opacity: 0, y: 12, transition: { duration: duration.fast, ease: ease.exit } },
};
const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: duration.fast } },
  exit: { opacity: 0, transition: { duration: duration.fast } },
};

export default function AuthDialog({ open, onRequestClose, onExited, labelledBy, initialFocusRef, children }) {
  const cardRef = useRef(null);
  const reduce = useReducedMotion();
  const desktop = useMediaQuery('(min-width: 640px)');
  const cardMotion = reduce ? fade : desktop ? console_ : sheet;
  // Fuera de la home no hay lienzo del viaje: el diálogo monta su propio planeta (solo en
  // pantallas anchas, donde se ve el escenario). Se decide al abrir, sin contar su propio lienzo
  const wide = useMediaQuery('(min-width: 1024px)');
  const hasGlobe = useMemo(
    () => open && [...document.querySelectorAll('#root canvas')].some((c) => !c.closest('[data-auth-overlay]')),
    [open],
  );
  // Móvil: la hoja se cierra arrastrándola hacia abajo desde el asa (no desde el contenido,
  // que tiene su propio scroll y campos)
  const drag = useDragControls();
  const sheetDrag = desktop ? {} : {
    drag: 'y',
    dragListener: false,
    dragControls: drag,
    dragConstraints: { top: 0, bottom: 0 },
    dragElastic: { top: 0, bottom: 0.7 },
    dragSnapToOrigin: true,
    onDragEnd: (_, info) => { if (shouldDismissSheet(info.offset.y, info.velocity.y)) onRequestClose(); },
  };
  const openerRef = useRef(null);

  // Quién lo abrió (antes de que el foco entre en el diálogo). Lo que ya está dentro del diálogo no
  // cuenta: en desarrollo StrictMode repite los efectos cuando el foco ya está en el primer campo
  useLayoutEffect(() => {
    const active = document.activeElement;
    if (open && !active?.closest('[role="dialog"]')) openerRef.current = active;
  }, [open]);

  const closeRef = useRef(onRequestClose);
  closeRef.current = onRequestClose;

  const edges = () => {
    const items = cardRef.current ? [...cardRef.current.querySelectorAll(`${FOCUSABLE}, iframe`)].filter(isTabStop) : [];
    return { first: items[0] ?? cardRef.current, last: items[items.length - 1] ?? cardRef.current };
  };

  useEffect(() => {
    if (!open) return undefined;
    const unlock = lockPage();
    (initialFocusRef?.current ?? cardRef.current)?.focus({ preventScroll: true });

    // En el documento (no en el velo): Escape funciona aunque el foco esté fuera de la tarjeta,
    // y Tab devuelve el foco a la tarjeta si se escapó (p. ej. desde el iframe de Google)
    const onKeyDown = (e) => {
      if (e.isComposing || !cardRef.current) return;
      const active = document.activeElement;
      // Otro diálogo que sigue operativo (el banner de cookies) gestiona su propio teclado
      const otherDialog = active?.closest('[role="dialog"]');
      if (otherDialog && otherDialog !== cardRef.current) return;
      if (e.key === 'Escape') {
        // Solo con el foco dentro del diálogo
        if (!cardRef.current.contains(active)) return;
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const { first, last } = edges();
      const outside = !cardRef.current.contains(active);
      if (outside || (e.shiftKey ? active === first : active === last)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    // Móvil con teclado virtual: la hoja ocupa solo lo visible (visualViewport) y el campo con foco
    // se mantiene a la vista dentro de su scroll. Se escribe en el estilo, sin estado de React.
    // En iOS el teclado desplaza el viewport visual (offsetTop): el velo lo sigue en posición y alto.
    // Con zoom de pellizco (scale ≠ 1) no se ajusta nada: la hoja conserva su tamaño de diseño.
    const card = cardRef.current;
    const layer = card?.parentElement;
    const vv = window.visualViewport;
    const fit = () => {
      if (!card || !layer) return;
      const zoomed = Math.abs((vv.scale ?? 1) - 1) > 0.01;
      card.style.setProperty('--auth-vh', zoomed ? '' : `${vv.height}px`);
      layer.style.top = zoomed ? '' : `${vv.offsetTop}px`;
      layer.style.height = zoomed ? '' : `${vv.height}px`;
    };
    const reveal = (e) => {
      if (e.target.matches?.('input')) requestAnimationFrame(() => e.target.scrollIntoView({ block: 'nearest' }));
    };
    if (vv) { fit(); vv.addEventListener('resize', fit); vv.addEventListener('scroll', fit); }
    card?.addEventListener('focusin', reveal);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      vv?.removeEventListener('resize', fit);
      vv?.removeEventListener('scroll', fit);
      card?.removeEventListener('focusin', reveal);
      unlock();
    };
  }, [open, initialFocusRef]);

  // Centinelas: el foco que sale de un iframe (que no emite keydown aquí) cae en ellos y vuelve dentro
  const sentinel = (to) => (
    <span tabIndex={0} className="sr-only" aria-hidden="true" onFocus={() => edges()[to]?.focus()} />
  );

  const handleExitComplete = () => {
    restoreFocus(openerRef.current);
    onExited?.();
  };

  // Sin portal: se pinta donde se monta (como antes), dentro del contexto `isolate` del layout,
  // para que el banner de cookies (z-[9999], mismo contexto) siga por encima y operativo
  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {open && (
        <motion.div
          key="auth-dialog"
          className="fixed inset-0 z-[60] flex items-start justify-center bg-canvas/80 sm:items-center sm:p-6 lg:justify-start lg:bg-transparent lg:px-gutter"
          data-lenis-prevent
          data-auth-overlay
          // Un clic en el velo no cierra ni saca el foco de la tarjeta
          onMouseDown={(e) => { if (e.target === e.currentTarget) e.preventDefault(); }}
          {...overlay}
        >
          {/* Escenario: lectura del panel a la izquierda; el planeta a la derecha */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block">
            {!hasGlobe && wide && (
              <Suspense fallback={null}>
                <AuthGlobe />
              </Suspense>
            )}
            <div className="absolute inset-0 bg-linear-to-r from-canvas via-canvas/60 to-transparent" />
          </div>
          {sentinel('last')}
          <motion.div
            ref={cardRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            tabIndex={-1}
            className="relative h-[var(--auth-vh,100dvh)] w-full overflow-y-auto overscroll-contain bg-surface/90 backdrop-blur-2xl outline-none sm:h-auto sm:max-h-[calc(100dvh-3rem)] sm:max-w-120 sm:rounded-3xl sm:glass-panel"
            {...cardMotion}
            {...sheetDrag}
          >
            {!desktop && (
              <div
                className="absolute left-1/2 top-[env(safe-area-inset-top)] z-10 flex h-11 w-24 -translate-x-1/2 touch-none cursor-grab items-center justify-center active:cursor-grabbing"
                onPointerDown={(e) => drag.start(e)}
                aria-hidden="true"
              >
                <span className="h-1.5 w-10 rounded-full bg-line-strong" />
              </div>
            )}
            {children}
          </motion.div>
          {sentinel('first')}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
