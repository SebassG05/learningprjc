import { useCallback, useEffect, useRef } from 'react';
import { gradeSubmission } from '../../../lib/adminApi';

export const UNDO_WINDOW_MS = 6000;

// Campos que devuelve el servidor y que conviene reflejar (la entrega viene sin populate)
const SERVER_FIELDS = ['estado', 'calificacion', 'feedbackProfesor', 'intentos', 'bloqueado', 'fechaRevision'];
const pick = (obj, keys) => Object.fromEntries(keys.filter((k) => k in obj).map((k) => [k, obj[k]]));

/**
 * Correcciones diferidas: el cambio se ve al instante (optimista) y la petición sale a los 6 s.
 * «Deshacer» dentro de ese plazo cancela la petición: el alumno no recibe ningún email.
 * Si la pestaña se oculta o se cierra, lo pendiente se envía ya con `keepalive`.
 *
 * - `apply(id, cambios)` aplica en la lista; `onError(entrega, err)` avisa si el servidor lo rechaza.
 */
export default function useDeferredGrades({ apply, onError }) {
  const pending = useRef(new Map()); // id → { timer, before, body }
  const cbs = useRef({ apply, onError });
  cbs.current = { apply, onError };

  const commit = useCallback(async (id, keepalive = false) => {
    const job = pending.current.get(id);
    if (!job) return;
    clearTimeout(job.timer);
    pending.current.delete(id);
    try {
      const res = await gradeSubmission(id, job.body, { keepalive });
      if (res?.entrega) cbs.current.apply(id, pick(res.entrega, SERVER_FIELDS));
    } catch (err) {
      cbs.current.apply(id, job.before);
      cbs.current.onError?.(job.label, err);
    }
  }, []);

  /**
   * Programa una corrección. `before` son los campos previos (para deshacer); `body` lo que se envía.
   * Si ya había otra pendiente para la misma entrega, se sustituye y se conserva el estado original.
   */
  const schedule = useCallback(
    (id, { before, body, label }) => {
      const prev = pending.current.get(id);
      if (prev) clearTimeout(prev.timer);
      const original = prev?.before ?? before;
      const optimistic = { estado: body.estado, calificacion: body.calificacion ?? undefined, feedbackProfesor: body.feedbackProfesor };
      cbs.current.apply(id, optimistic);
      const timer = setTimeout(() => commit(id), UNDO_WINDOW_MS);
      pending.current.set(id, { timer, before: original, body, label });

      return () => {
        const job = pending.current.get(id);
        if (!job) return false;
        clearTimeout(job.timer);
        pending.current.delete(id);
        cbs.current.apply(id, job.before);
        return true;
      };
    },
    [commit]
  );

  const flushAll = useCallback((keepalive = true) => {
    [...pending.current.keys()].forEach((id) => commit(id, keepalive));
  }, [commit]);

  // Pestaña oculta o cerrada, o salir del panel: no se pierde ninguna corrección
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') flushAll(true);
    };
    const onPageHide = () => flushAll(true);
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onPageHide);
    return () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onPageHide);
      flushAll(true);
    };
  }, [flushAll]);

  return { schedule, isPending: (id) => pending.current.has(id) };
}
