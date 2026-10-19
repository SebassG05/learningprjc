import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DEFAULT_FILTERS, filtersFromParams, hasActiveFilters, paramsFromFilters } from './submissionQuery';

// Filtros del listado guardados en la URL: sobreviven a una recarga y se pueden compartir.
export default function useSubmissionFilters() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => filtersFromParams(params), [params]);

  const setFilters = useCallback(
    (patch) => setParams((current) => paramsFromFilters({ ...filtersFromParams(current), ...patch }, current), { replace: true }),
    [setParams]
  );

  const clearFilters = useCallback(
    () => setParams((current) => paramsFromFilters({ ...DEFAULT_FILTERS, orden: filtersFromParams(current).orden }, current), { replace: true }),
    [setParams]
  );

  return { filters, setFilters, clearFilters, active: hasActiveFilters(filters) };
}
