import { useEffect, useState } from 'react';
import { fetchEnrollments } from '../../../lib/adminApi';

/**
 * Inscripciones de un curso con el resumen de entregas de cada alumno (una sola petición:
 * un curso tiene pocos cientos de alumnos como mucho; el filtrado y el orden son locales).
 * Al cambiar de curso se mantiene el anterior hasta que llega el nuevo.
 */
export default function useCourseProgress(courseId) {
  const [state, setState] = useState({ status: 'idle', enrollments: [], exercises: 0, courseId: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!courseId) return undefined;
    const c = new AbortController();
    setState((s) => ({ ...s, status: s.courseId ? 'refreshing' : 'loading' }));
    fetchEnrollments(courseId, c.signal)
      .then((r) => setState({ status: 'ready', enrollments: r.enrollments ?? [], exercises: r.curso?.ejercicios ?? 0, courseId }))
      .catch((err) => {
        if (err.name !== 'AbortError') setState((s) => ({ ...s, status: 'error' }));
      });
    return () => c.abort();
  }, [courseId, attempt]);

  return { ...state, reload: () => setAttempt((n) => n + 1) };
}
