import { useEffect, useState } from 'react';
import { fetchEnrollments, fetchSubmissions } from '../../../lib/adminApi';
import { summarizeSubmissions } from './progresoQuery';

/**
 * Inscripciones de un curso con el resumen de entregas de cada alumno (una sola petición:
 * un curso tiene pocos cientos de alumnos como mucho; el filtrado y el orden son locales).
 * Al cambiar de curso se mantiene el anterior hasta que llega el nuevo.
 *
 * Compatibilidad: si el backend aún es el anterior (inscripciones sin `entregas`), el resumen se
 * calcula con la lista de entregas. Si eso falla, se muestran las inscripciones sin él.
 */
export default function useCourseProgress(courseId) {
  const [state, setState] = useState({ status: 'idle', enrollments: [], exercises: 0, courseId: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!courseId) return undefined;
    const c = new AbortController();
    setState((s) => ({ ...s, status: s.courseId ? 'refreshing' : 'loading' }));
    (async () => {
      const r = await fetchEnrollments(courseId, c.signal);
      let enrollments = r.enrollments ?? [];
      if (enrollments.length && enrollments.every((e) => e.entregas === undefined)) {
        try {
          const all = await fetchSubmissions(undefined, c.signal);
          const byUser = summarizeSubmissions(all.entregas ?? [], courseId);
          enrollments = enrollments.map((e) => ({ ...e, entregas: (e.userId && byUser.get(String(e.userId))) || undefined }));
        } catch (err) {
          if (err.name === 'AbortError') throw err;
        }
      }
      return { status: 'ready', enrollments, exercises: r.curso?.ejercicios ?? 0, courseId };
    })()
      .then(setState)
      .catch((err) => {
        if (err.name !== 'AbortError') setState((s) => ({ ...s, status: 'error' }));
      });
    return () => c.abort();
  }, [courseId, attempt]);

  return { ...state, reload: () => setAttempt((n) => n + 1) };
}
