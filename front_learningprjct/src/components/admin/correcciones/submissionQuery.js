// Filtros del listado de entregas: URL (?q=&estado=&curso=&fecha=&orden=) ⇄ filtros ⇄ parámetros de la API.
import { STATUS_ORDER } from '../shared/submissionStatus.js';
import { DATE_PRESETS, createUrlFilters, isDatePreset, isObjectId, presetSince } from '../shared/urlFilters.js';

export { DATE_PRESETS };
export const PAGE_SIZE = 20;

export const SORTS = [
  { value: 'prioridad', label: 'Prioridad' },
  { value: 'recientes', label: 'Más recientes' },
  { value: 'antiguas', label: 'Más antiguas' },
  { value: 'nota', label: 'Nota más alta' },
];

export const submissionFilters = createUrlFilters({
  defaults: { q: '', estado: '', curso: '', fecha: '', orden: 'prioridad' },
  valid: {
    estado: (v) => STATUS_ORDER.includes(v),
    curso: isObjectId,
    fecha: isDatePreset,
    orden: (v) => SORTS.some((s) => s.value === v),
  },
  ignore: ['orden'],
});

export const DEFAULT_FILTERS = submissionFilters.defaults;
export const filtersFromParams = submissionFilters.fromParams;
export const paramsFromFilters = submissionFilters.toParams;
export const hasActiveFilters = submissionFilters.hasActive;

export function apiParams(filters, page, now = Date.now()) {
  return {
    page,
    limit: PAGE_SIZE,
    orden: filters.orden,
    q: filters.q || undefined,
    estado: filters.estado || undefined,
    curso: filters.curso || undefined,
    desde: presetSince(filters.fecha, now),
  };
}
