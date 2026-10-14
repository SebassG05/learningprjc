/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Contenedor modal del acceso: velo, tarjeta con role="dialog", foco atrapado,
// Escape, fondo inerte, bloqueo de scroll sin salto y vuelta del foco al cerrar. No sabe nada de
// autenticación: solo abre, cierra y avisa al lienzo del viaje (journey.overlay).
import { useEffect, useLayoutEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { overlay, panel } from '../../lib/motion';
import { setOverlay } from '../globe/journey/store';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const isVisible = (el) => el.getClientRects().length > 0;
const canReceiveFocus = (el) =>
  !!el && el !== document.body && el.isConnected && isVisible(el) && !el.closest('[inert]');

// Lo que debe seguir operativo bajo el diálogo: el banner de cookies (otro diálogo) y los avisos
const KEEP = '[role="dialog"], [role="alertdialog"], [role="status"], [aria-live]';

// Marca inerte todo lo que cuelga de `node` salvo las ramas que contienen algo de KEEP
function inertOutside(node, out) {
  for (const child of node.children) {
    if (child.matches(KEEP)) continue;
    if (child.querySelector(KEEP)) inertOutside(child, out);
    else if (!child.inert) { child.inert = true; out.push(child); }
  }
  return out;
}

// Fondo inerte + scroll bloqueado mientras el diálogo está abierto. Devuelve cómo deshacerlo.
function lockPage() {
  const root = document.getElementById('root');
  const inerted = root ? inertOutside(root, []) : [];

  const html = document.documentElement;
  const prev = { overflow: html.style.overflow, gutter: html.style.scrollbarGutter };
  // Reserva el hueco de la barra solo si la había: sin salto en páginas largas ni en las cortas
  const hadScrollbar = window.innerWidth > html.clientWidth;
  html.style.overflow = 'hidden';
  if (hadScrollbar) html.style.scrollbarGutter = 'stable';
  setOverlay(true);

  return () => {
    inerted.forEach((el) => { el.inert = false; });
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

export default function AuthDialog({ open, onRequestClose, onExited, labelledBy, initialFocusRef, children }) {
  const cardRef = useRef(null);
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
    const items = cardRef.current ? [...cardRef.current.querySelectorAll(FOCUSABLE)].filter(isVisible) : [];
    return { first: items[0] ?? cardRef.current, last: items[items.length - 1] ?? cardRef.current };
  };

  useEffect(() => {
    if (!open) return undefined;
    const unlock = lockPage();
    (initialFocusRef?.current ?? cardRef.current)?.focus({ preventScroll: true });

    // En el documento (no en el velo): Escape funciona aunque el foco esté fuera de la tarjeta,
    // y Tab devuelve el foco a la tarjeta si se escapó (p. ej. desde el iframe de Google)
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab' || !cardRef.current) return;
      const { first, last } = edges();
      const active = document.activeElement;
      const outside = !cardRef.current.contains(active);
      if (outside || (e.shiftKey ? active === first : active === last)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
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
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-6"
          data-lenis-prevent
          {...overlay}
        >
          {sentinel('last')}
          <motion.div
            ref={cardRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            tabIndex={-1}
            className="relative w-full max-w-120 max-h-[100dvh] overflow-y-auto overscroll-contain rounded-t-3xl border border-line bg-surface/80 shadow-overlay backdrop-blur-2xl outline-none sm:rounded-3xl"
            {...panel}
          >
            {children}
          </motion.div>
          {sentinel('first')}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
