import { useCallback, useEffect, useState } from 'react';
import { fetchCatalog, fetchCourses, fetchEnrollmentMap } from '../../lib/coursesApi';

const loadCatalog = (signal) => Promise.all([fetchCourses(signal), fetchCatalog().catch(() => null)]);

// La primera carga empieza en cuanto se evalúa el chunk de la ruta, sin esperar al primer render.
// Se consume una sola vez; los reintentos y las visitas siguientes piden datos frescos.
let early = typeof window !== 'undefined' ? loadCatalog() : null;
early?.catch(() => {});
const takeEarly = () => {
  const p = early;
  early = null;
  return p;
};

// Cursos y catálogo (áreas y niveles) en paralelo; el progreso del alumno, aparte y con una sola petición.
// Si el catálogo no responde, el listado funciona igual, solo sin filtro de áreas.
export default function useCourseCatalog(userId) {
  const [state, setState] = useState({ status: 'loading', courses: [], catalog: null });
  const [attempt, setAttempt] = useState(0);
  const [progress, setProgress] = useState(() => new Map());

  useEffect(() => {
    const ctrl = new AbortController();
    let alive = true;
    setState((s) => ({ ...s, status: 'loading' }));
    ((attempt === 0 && takeEarly()) || loadCatalog(ctrl.signal))
      .then(([courses, catalog]) => {
        if (alive) setState({ status: 'ready', courses: Array.isArray(courses) ? courses : [], catalog });
      })
      .catch((err) => {
        if (alive && err.name !== 'AbortError') setState((s) => ({ ...s, status: 'error' }));
      });
    return () => {
      alive = false;
      ctrl.abort();
    };
  }, [attempt]);

  useEffect(() => {
    let token = null;
    try {
      token = localStorage.getItem('token');
    } catch {
      /* sin almacenamiento no hay sesión que consultar */
    }
    if (!userId || !token) {
      setProgress(new Map());
      return undefined;
    }
    const ctrl = new AbortController();
    fetchEnrollmentMap(token, ctrl.signal)
      .then(setProgress)
      .catch(() => {
        /* sin progreso las tarjetas se ven igual, solo sin la barra */
      });
    return () => ctrl.abort();
  }, [userId]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, progress, retry };
}
