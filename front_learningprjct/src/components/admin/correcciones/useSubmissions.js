import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchSubmissions } from '../../../lib/adminApi';
import { apiParams, shiftStats } from './submissionQuery';

const EMPTY = { items: [], stats: null, total: 0, page: 0, pages: 1 };

/**
 * Entregas paginadas en servidor (scroll infinito: las páginas se acumulan).
 * Al cambiar los filtros se conserva la lista anterior mientras llega la nueva (`refreshing`),
 * para que no parpadee; el esqueleto solo aparece en la primera carga.
 * `patch` aplica cambios locales (corrección optimista y deshacer) y mueve las cifras por estado.
 */
export default function useSubmissions(filters) {
  const [data, setData] = useState(EMPTY);
  const [status, setStatus] = useState('loading'); // loading | refreshing | ready | loadingMore | error
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const ctrl = useRef(null);
  const itemsRef = useRef(data.items);
  itemsRef.current = data.items;
  const key = JSON.stringify(filters);

  useEffect(() => {
    ctrl.current?.abort();
    const c = new AbortController();
    ctrl.current = c;
    setStatus((s) => (s === 'loading' || s === 'error' ? 'loading' : 'refreshing'));
    setError(null);
    fetchSubmissions(apiParams(filters, 1), c.signal)
      .then((r) => {
        setData({ items: r.entregas, stats: r.stats, total: r.total, page: r.page, pages: r.pages });
        setStatus('ready');
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err);
        setStatus('error');
      });
    return () => c.abort();
    // `key` resume los filtros: el objeto cambia de identidad en cada render de la URL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt]);

  const hasMore = data.page < data.pages;

  const loadMore = useCallback(async () => {
    if (status !== 'ready' || !hasMore) return null;
    setStatus('loadingMore');
    try {
      const r = await fetchSubmissions(apiParams(filters, data.page + 1));
      // Sin duplicados si una corrección movió elementos entre páginas
      const seen = new Set(itemsRef.current.map((x) => x._id));
      const added = r.entregas.filter((x) => !seen.has(x._id));
      setData((d) => ({ ...d, items: [...d.items, ...added], page: r.page, pages: r.pages, total: r.total }));
      setStatus('ready');
      return added;
    } catch (err) {
      setError(err);
      setStatus('ready');
      return null;
    }
  }, [status, hasMore, filters, data.page]);

  const patch = useCallback((id, changes) => {
    setData((d) => {
      const prev = d.items.find((x) => x._id === id);
      if (!prev) return d;
      return {
        ...d,
        items: d.items.map((x) => (x._id === id ? { ...x, ...changes } : x)),
        stats: changes.estado ? shiftStats(d.stats, prev.estado, changes.estado) : d.stats,
      };
    });
  }, []);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...data, status, error, hasMore, loadMore, patch, reload };
}
