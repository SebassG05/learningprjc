import { useEffect, useRef } from 'react';

const isTyping = (el) =>
  el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

/**
 * Atajos del panel de corrección (escritorio):
 * J / K siguiente / anterior · A aprobar · R rechazar · Ctrl/⌘+Enter guardar (con Mayús: guardar y siguiente).
 * Las letras no actúan mientras se escribe en un campo; Ctrl/⌘+Enter sí, también desde el comentario.
 * Escape lo gestiona el propio panel (trampa de foco). Sin animaciones: son acciones de teclado repetidas.
 */
export default function useReviewShortcuts(enabled, handlers) {
  const ref = useRef(handlers);
  ref.current = handlers;

  useEffect(() => {
    if (!enabled) return undefined;
    const onKey = (e) => {
      const h = ref.current;
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        (e.shiftKey ? h.onSaveNext : h.onSave)?.();
        return;
      }
      if (e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target) || e.repeat) return;
      const action = { j: h.onNext, k: h.onPrev, a: h.onApprove, r: h.onReject }[e.key.toLowerCase()];
      if (!action) return;
      e.preventDefault();
      action();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [enabled]);
}
