import { useEffect, useMemo, useState } from 'react';
import { fetchAllEnrollments } from '../../../lib/adminApi';
import { isMissingEndpoint, loadLegacyEnrollments } from './legacyEnrollments';
import { groupByDay, legacyEnrollmentPage, monthKey, monthParams } from './reservasQuery';

/**
 * Inscripciones de un mes para la vista de calendario: una sola petición agrupada por día local.
 * Al cambiar de mes se mantiene el anterior hasta que llega el nuevo (sin parpadeo).
 * Con el backend anterior se calculan desde el endpoint por curso.
 */
export default function useEnrollmentMonth(filters, first, enabled = true, courses = []) {
  const [state, setState] = useState({ status: 'loading', items: [], stats: null, total: 0, month: null });
  const [attempt, setAttempt] = useState(0);
  const [legacyMode, setLegacyMode] = useState(false);
  const coursesKey = legacyMode ? courses.map((c) => c._id).join() : '';
  const key = JSON.stringify([filters.q, filters.curso, filters.estado, monthKey(first), attempt, coursesKey]);

  useEffect(() => {
    if (!enabled) return undefined;
    const c = new AbortController();
    const params = monthParams(filters, first);
    const fromLegacy = async () => {
      const rows = await loadLegacyEnrollments(courses, c.signal);
      const r = legacyEnrollmentPage(rows, filters, 1, { range: { desde: params.desde, hasta: params.hasta }, limit: params.limit });
      return { inscripciones: r.items, stats: r.stats, total: r.total };
    };
    setState((s) => ({ ...s, status: s.month ? 'refreshing' : 'loading' }));
    (legacyMode ? fromLegacy() : fetchAllEnrollments(params, c.signal).catch((err) => {
      if (!isMissingEndpoint(err)) throw err;
      setLegacyMode(true);
      return fromLegacy();
    }))
      .then((r) => setState({ status: 'ready', items: r.inscripciones, stats: r.stats, total: r.total, month: monthKey(first) }))
      .catch((err) => {
        if (err.name !== 'AbortError') setState((s) => ({ ...s, status: 'error' }));
      });
    return () => c.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  const byDay = useMemo(() => groupByDay(state.items), [state.items]);
  return { ...state, byDay, truncated: state.total > state.items.length, reload: () => setAttempt((n) => n + 1) };
}
