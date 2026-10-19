import { useCallback } from 'react';
import { fetchSubmissions } from '../../../lib/adminApi';
import usePagedList from '../shared/usePagedList';
import { apiParams } from './submissionQuery';

/**
 * Entregas paginadas en servidor (scroll infinito). `patch` aplica la corrección optimista
 * (o la deshace) y mueve las cifras por estado.
 */
export default function useSubmissions(filters) {
  const key = JSON.stringify(filters);
  const fetchPage = useCallback(
    (page, signal) =>
      fetchSubmissions(apiParams(filters, page), signal).then((r) => ({
        items: r.entregas,
        stats: r.stats,
        total: r.total,
        page: r.page,
        pages: r.pages,
      })),
    // `key` resume los filtros (el objeto cambia de identidad en cada lectura de la URL)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );
  const list = usePagedList(fetchPage, key);
  const patch = useCallback((id, changes) => list.patch(id, changes, 'estado'), [list.patch]); // eslint-disable-line react-hooks/exhaustive-deps
  return { ...list, patch };
}
