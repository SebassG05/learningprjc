import { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

// Trampas activas, la última es la de arriba: con un diálogo encima de otro (p. ej. «¿descartar
// cambios?» sobre un panel) solo la superior atiende Escape y Tab.
const stack = [];

// Mantiene el foco dentro de `ref` mientras `active`, cierra con Escape y, al cerrar,
// devuelve el foco al elemento que lo tenía antes de abrir (o al que indique `getReturnFocus`).
export default function useFocusTrap(ref, active, onEscape, getReturnFocus) {
  // Los callbacks van en refs para no reiniciar la trampa (ni mover el foco) en cada render
  const escapeRef = useRef(onEscape);
  escapeRef.current = onEscape;
  const returnRef = useRef(getReturnFocus);
  returnRef.current = getReturnFocus;

  useEffect(() => {
    if (!active || !ref.current) return undefined;
    const root = ref.current;
    const token = {};
    stack.push(token);
    const previous = document.activeElement;
    const items = () => [...root.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);

    const first = items()[0];
    first?.focus({ preventScroll: true });

    const onKey = (e) => {
      if (stack[stack.length - 1] !== token) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        escapeRef.current?.();
        return;
      }
      if (e.key !== 'Tab') return;
      const list = items();
      if (list.length === 0) return;
      const head = list[0];
      const tail = list[list.length - 1];
      if (e.shiftKey && document.activeElement === head) {
        e.preventDefault();
        tail.focus();
      } else if (!e.shiftKey && document.activeElement === tail) {
        e.preventDefault();
        head.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      stack.splice(stack.indexOf(token), 1);
      const target = returnRef.current?.() ?? previous;
      if (target instanceof HTMLElement && target.isConnected) target.focus({ preventScroll: true });
    };
  }, [ref, active]);
}

// ¿Hay algún diálogo con trampa de foco abierto? (los atajos de teclado globales se apagan)
export const hasOpenFocusTrap = () => stack.length > 0;
