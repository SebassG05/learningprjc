import { useEffect, useMemo, useState } from 'react';
import { fetchAllEnrollments } from '../../../lib/adminApi';
import { groupByDay, monthKey, monthParams } from './reservasQuery';

/**
 * Inscripciones de un mes para la vista de calendario: una sola petición agrupada por día local.
 * Al cambiar de mes se mantiene el anterior hasta que llega el nuevo (sin parpadeo).
 */
export default function useEnrollmentMonth(filters, first, enabled = true) {
  const [state, setState] = useState({ status: 'loading', items: [], stats: null, total: 0, month: null });
  const [attempt, setAttempt] = useState(0);
  const key = JSON.stringify([filters.q, filters.curso, filters.estado, monthKey(first), attempt]);

  useEffect(() => {
    if (!enabled) return undefined;
    const c = new AbortController();
    setState((s) => ({ ...s, status: s.month ? 'refreshing' : 'loading' }));
    fetchAllEnrollments(monthParams(filters, first), c.signal)
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
