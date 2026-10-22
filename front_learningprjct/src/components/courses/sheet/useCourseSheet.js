import { useCallback, useEffect, useState } from 'react';
import { fetchCatalog, fetchCourse, fetchEnrollmentStatus, peekCourse, readToken } from '../../../lib/coursesApi';
import { isCourseId } from '../courseFormat';

// Entrada directa por URL: la petición del curso empieza al evaluarse el chunk, sin esperar al render
const direct = typeof window !== 'undefined' ? window.location.pathname.match(/^\/curso\/([a-f0-9]{24})\/inscripcion\/?$/i) : null;
let early = direct ? { id: direct[1], promise: fetchCourse(direct[1]) } : null;
early?.promise.catch(() => {});
const takeEarly = (id) => {
  const hit = early?.id === id ? early.promise : null;
  early = null;
  return hit;
};

const initialState = (id) => {
  if (!isCourseId(id)) return { status: 'notfound', course: null };
  const cached = peekCourse(id);
  return cached ? { status: 'ready', course: cached } : { status: 'loading', course: null };
};

// Datos de la ficha. Si el curso llegó ya con el listado se pinta al instante y se revalida detrás.
// enrollment.status: 'anon' (sin sesión) | 'loading' | 'ready'
export default function useCourseSheet(id, userId) {
  const [state, setState] = useState(() => initialState(id));
  const [attempt, setAttempt] = useState(0);
  const [catalog, setCatalog] = useState(null);
  const [enrollment, setEnrollment] = useState({ status: 'loading', data: null });

  useEffect(() => {
    if (!isCourseId(id)) {
      setState({ status: 'notfound', course: null });
      return undefined;
    }
    const ctrl = new AbortController();
    let alive = true;
    setState((s) => (s.course && String(s.course._id) === id ? s : initialState(id)));
    ((attempt === 0 && takeEarly(id)) || fetchCourse(id, ctrl.signal))
      .then((course) => {
        if (alive) setState({ status: 'ready', course });
      })
      .catch((err) => {
        if (!alive || err.name === 'AbortError') return;
        // Si ya se ve la versión del listado, se queda; si no, se explica qué pasa
        setState((s) => (s.course ? s : { status: err.status === 404 ? 'notfound' : 'error', course: null }));
      });
    return () => {
      alive = false;
      ctrl.abort();
    };
    // userId: al entrar o salir se vuelve a pedir (en un curso privado cambia lo que se ve)
  }, [id, attempt, userId]);

  // El catálogo solo da el nombre del área (miga de pan): se pide tras el primer pintado de la ficha,
  // para no competir con la petición del curso ni con el LCP
  const ready = state.status === 'ready';
  useEffect(() => {
    if (!ready) return undefined;
    let alive = true;
    const idle = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 1));
    const cancel = window.cancelIdleCallback ?? clearTimeout;
    const handle = idle(() =>
      fetchCatalog()
        .then((c) => alive && setCatalog(c))
        .catch(() => {
          /* sin catálogo la ficha no muestra el área */
        })
    );
    return () => {
      alive = false;
      cancel(handle);
    };
  }, [ready]);

  useEffect(() => {
    const token = readToken();
    if (!userId || !token || !isCourseId(id)) {
      setEnrollment({ status: 'anon', data: null });
      return undefined;
    }
    const ctrl = new AbortController();
    setEnrollment({ status: 'loading', data: null });
    fetchEnrollmentStatus(id, token, ctrl.signal)
      .then((data) => setEnrollment({ status: 'ready', data }))
      .catch((err) => {
        if (err.name !== 'AbortError') setEnrollment({ status: 'ready', data: null });
      });
    return () => ctrl.abort();
  }, [id, userId]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const markEnrolled = useCallback(() => setEnrollment((e) => ({ status: 'ready', data: { ...e.data, enrolled: true } })), []);

  return { ...state, catalog, enrollment, retry, markEnrolled };
}
