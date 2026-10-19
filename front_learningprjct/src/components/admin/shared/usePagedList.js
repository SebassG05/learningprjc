import { useCallback, useEffect, useRef, useState } from 'react';

const EMPTY = { items: [], stats: null, total: 0, page: 0, pages: 1 };

/**
 * Listado paginado en servidor con scroll infinito (las páginas se acumulan).
 * - `fetchPage(page, signal)` devuelve { items, stats, total, page, pages }.
 * - `key` resume los filtros: al cambiar se pide la página 1 conservando la lista anterior
 *   mientras llega la nueva (`refreshing`), sin parpadeo; el esqueleto solo en la primera carga.
 * - `patch(id, cambios, statKey)` aplica un cambio local y mueve la cifra de `statKey` de un valor a otro.
 */
export default function usePagedList(fetchPage, key) {
  const [data, setData] = useState(EMPTY);
  const [status, setStatus] = useState('loading'); // loading | refreshing | ready | loadingMore | error
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const ctrl = useRef(null);
  const itemsRef = useRef(data.items);
  itemsRef.current = data.items;
  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;

  useEffect(() => {
    ctrl.current?.abort();
    const c = new AbortController();
    ctrl.current = c;
    setStatus((s) => (s === 'loading' || s === 'error' ? 'loading' : 'refreshing'));
    setError(null);
    fetchRef.current(1, c.signal)
      .then((r) => {
        setData(r);
        setStatus('ready');
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err);
        setStatus('error');
      });
    return () => c.abort();
  }, [key, attempt]);

  const hasMore = data.page < data.pages;

  const loadMore = useCallback(async () => {
    if (status !== 'ready' || !hasMore) return null;
    setStatus('loadingMore');
    try {
      const r = await fetchRef.current(data.page + 1);
      // Sin duplicados si un cambio movió elementos entre páginas
      const seen = new Set(itemsRef.current.map((x) => x._id));
      const added = r.items.filter((x) => !seen.has(x._id));
      setData((d) => ({ ...d, items: [...d.items, ...added], page: r.page, pages: r.pages, total: r.total }));
      setStatus('ready');
      return added;
    } catch (err) {
      setError(err);
      setStatus('ready');
      return null;
    }
  }, [status, hasMore, data.page]);

  const patch = useCallback((id, changes, statKey) => {
    setData((d) => {
      const prev = d.items.find((x) => x._id === id);
      if (!prev) return d;
      let stats = d.stats;
      if (statKey && statKey in changes && stats && prev[statKey] !== changes[statKey]) {
        stats = { ...stats };
        if (prev[statKey] in stats) stats[prev[statKey]] = Math.max(0, stats[prev[statKey]] - 1);
        if (changes[statKey] in stats) stats[changes[statKey]] += 1;
      }
      return { ...d, items: d.items.map((x) => (x._id === id ? { ...x, ...changes } : x)), stats };
    });
  }, []);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  return { ...data, status, error, hasMore, loadMore, patch, reload };
}
