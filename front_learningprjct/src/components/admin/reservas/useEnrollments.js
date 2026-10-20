import { useCallback, useRef, useState } from 'react';
import { fetchAllEnrollments } from '../../../lib/adminApi';
import usePagedList from '../shared/usePagedList';
import { isMissingEndpoint, loadLegacyEnrollments } from './legacyEnrollments';
import { legacyEnrollmentPage, listParams } from './reservasQuery';

/**
 * Inscripciones paginadas en servidor (vista de lista, scroll infinito).
 * Con el backend anterior (sin el endpoint global) se arman desde el endpoint por curso y se
 * paginan en el navegador; en ese modo la lista se recalcula cuando llegan los cursos.
 */
export default function useEnrollments(filters, enabled = true, courses = []) {
  const [legacyMode, setLegacyMode] = useState(false);
  const legacy = useRef(null);
  const coursesKey = legacyMode ? courses.map((c) => c._id).join() : '';
  const key = enabled ? JSON.stringify([filters.q, filters.curso, filters.estado, filters.fecha, filters.orden, coursesKey]) : 'off';

  const fetchPage = useCallback(
    async (page, signal) => {
      if (!enabled) return new Promise(() => {});
      if (legacyMode) {
        if (page === 1 || !legacy.current) legacy.current = await loadLegacyEnrollments(courses, signal);
        return legacyEnrollmentPage(legacy.current, filters, page);
      }
      try {
        const r = await fetchAllEnrollments(listParams(filters, page), signal);
        return { items: r.inscripciones, stats: r.stats, total: r.total, page: r.page, pages: r.pages };
      } catch (err) {
        if (!isMissingEndpoint(err)) throw err;
        setLegacyMode(true);
        legacy.current = await loadLegacyEnrollments(courses, signal);
        return legacyEnrollmentPage(legacy.current, filters, page);
      }
    },
    // `key` resume los filtros y, en modo compatibilidad, los cursos
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );
  return usePagedList(fetchPage, key);
}
