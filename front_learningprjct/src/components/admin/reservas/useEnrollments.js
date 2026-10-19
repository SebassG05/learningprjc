import { useCallback } from 'react';
import { fetchAllEnrollments } from '../../../lib/adminApi';
import usePagedList from '../shared/usePagedList';
import { listParams } from './reservasQuery';

// Inscripciones paginadas en servidor (vista de lista, scroll infinito)
export default function useEnrollments(filters, enabled = true) {
  const key = enabled ? JSON.stringify([filters.q, filters.curso, filters.estado, filters.fecha, filters.orden]) : 'off';
  const fetchPage = useCallback(
    (page, signal) =>
      enabled
        ? fetchAllEnrollments(listParams(filters, page), signal).then((r) => ({
            items: r.inscripciones,
            stats: r.stats,
            total: r.total,
            page: r.page,
            pages: r.pages,
          }))
        : new Promise(() => {}),
    // `key` resume los filtros que afectan a la lista
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );
  return usePagedList(fetchPage, key);
}
