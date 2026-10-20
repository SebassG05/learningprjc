import { useCallback, useEffect, useState } from 'react';
import { fetchCourses } from '../../../lib/adminApi';

// Una sola petición por carga del panel, compartida por todas las pestañas
let cache = null;
let inflight = null;

const load = (force = false) => {
  if (force) cache = null;
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetchCourses()
      .then((list) => {
        cache = Array.isArray(list) ? list : [];
        return cache;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
};

// Lista de cursos para selectores y vistas del panel. `update` refleja cambios locales (abrir/cerrar…).
export default function useAdminCourses() {
  const [courses, setCourses] = useState(cache ?? []);
  const [status, setStatus] = useState(cache ? 'ready' : 'loading');

  const run = useCallback((force) => {
    setStatus((s) => (s === 'ready' && !force ? s : 'loading'));
    return load(force)
      .then((list) => {
        setCourses(list);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  useEffect(() => {
    run(false);
  }, [run]);

  const update = useCallback((id, changes) => {
    setCourses((list) => {
      const next = list.map((c) => (c._id === id ? { ...c, ...changes } : c));
      cache = next;
      return next;
    });
  }, []);

  // Curso creado o guardado desde Gestión: se sustituye (o se añade al principio)
  const upsert = useCallback((course) => {
    setCourses((list) => {
      const next = list.some((c) => c._id === course._id) ? list.map((c) => (c._id === course._id ? course : c)) : [course, ...list];
      cache = next;
      return next;
    });
  }, []);

  const removeLocal = useCallback((id) => {
    setCourses((list) => {
      const next = list.filter((c) => c._id !== id);
      cache = next;
      return next;
    });
  }, []);

  return { courses, status, reload: () => run(true), update, upsert, removeLocal };
}
