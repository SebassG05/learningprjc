import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

// Filtros de un listado en la URL (creados con createUrlFilters): sobreviven a una recarga y se comparten.
export default function useUrlFilters(spec) {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => spec.fromParams(params), [params, spec]);

  const setFilters = useCallback(
    (patch) => setParams((current) => spec.toParams({ ...spec.fromParams(current), ...patch }, current), { replace: true }),
    [setParams, spec]
  );

  const clearFilters = useCallback(
    () => setParams((current) => spec.toParams(spec.cleared(spec.fromParams(current)), current), { replace: true }),
    [setParams, spec]
  );

  return { filters, setFilters, clearFilters, active: spec.hasActive(filters) };
}
