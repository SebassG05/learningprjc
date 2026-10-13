import { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

// Mantiene el foco dentro de `ref` mientras `active`, cierra con Escape y, al cerrar,
// devuelve el foco al elemento que lo tenía antes de abrir.
export default function useFocusTrap(ref, active, onEscape) {
  // El callback va en un ref para no reiniciar la trampa (ni mover el foco) en cada render
  const escapeRef = useRef(onEscape);
  escapeRef.current = onEscape;

  useEffect(() => {
    if (!active || !ref.current) return undefined;
    const root = ref.current;
    const previous = document.activeElement;
    const items = () => [...root.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);

    const first = items()[0];
    first?.focus({ preventScroll: true });

    const onKey = (e) => {
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
      if (previous instanceof HTMLElement) previous.focus({ preventScroll: true });
    };
  }, [ref, active]);
}
