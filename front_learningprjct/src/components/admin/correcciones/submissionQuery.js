// Filtros del listado de entregas: URL (?q=&estado=&curso=&fecha=&orden=) ⇄ filtros ⇄ parámetros de la API.
import { STATUS_ORDER } from '../shared/submissionStatus.js';

export const PAGE_SIZE = 20;

export const SORTS = [
  { value: 'prioridad', label: 'Prioridad' },
  { value: 'recientes', label: 'Más recientes' },
  { value: 'antiguas', label: 'Más antiguas' },
  { value: 'nota', label: 'Nota más alta' },
];

export const DATE_PRESETS = [
  { value: '', label: 'Cualquier fecha', days: null },
  { value: '7d', label: 'Últimos 7 días', days: 7 },
  { value: '30d', label: 'Últimos 30 días', days: 30 },
  { value: '90d', label: 'Últimos 3 meses', days: 90 },
];

export const DEFAULT_FILTERS = { q: '', estado: '', curso: '', fecha: '', orden: 'prioridad' };
const KEYS = Object.keys(DEFAULT_FILTERS);

const valid = {
  estado: (v) => STATUS_ORDER.includes(v),
  curso: (v) => /^[a-f0-9]{24}$/i.test(v),
  fecha: (v) => DATE_PRESETS.some((p) => p.value === v),
  orden: (v) => SORTS.some((s) => s.value === v),
  q: () => true,
};

// Lo que no es válido en la URL se ignora (un enlace viejo o editado a mano no rompe la vista)
export function filtersFromParams(params) {
  const f = { ...DEFAULT_FILTERS };
  KEYS.forEach((k) => {
    const v = params.get(k);
    if (v && valid[k](v)) f[k] = k === 'q' ? v.slice(0, 100) : v;
  });
  return f;
}

// Solo lo que difiere del valor por defecto va a la URL; `tab` se conserva
export function paramsFromFilters(filters, current) {
  const next = new URLSearchParams();
  const tab = current?.get?.('tab');
  if (tab) next.set('tab', tab);
  KEYS.forEach((k) => {
    if (filters[k] && filters[k] !== DEFAULT_FILTERS[k]) next.set(k, filters[k]);
  });
  return next;
}

export const hasActiveFilters = (f) => KEYS.some((k) => k !== 'orden' && f[k] !== DEFAULT_FILTERS[k]);

export function apiParams(filters, page, now = Date.now()) {
  const preset = DATE_PRESETS.find((p) => p.value === filters.fecha);
  return {
    page,
    limit: PAGE_SIZE,
    orden: filters.orden,
    q: filters.q || undefined,
    estado: filters.estado || undefined,
    curso: filters.curso || undefined,
    desde: preset?.days ? new Date(now - preset.days * 864e5).toISOString() : undefined,
  };
}

// Recalcula las cifras por estado tras un cambio local (corrección optimista o deshacer)
export function shiftStats(stats, from, to) {
  if (!stats || from === to) return stats;
  const next = { ...stats };
  if (from in next) next[from] = Math.max(0, next[from] - 1);
  if (to in next) next[to] += 1;
  return next;
}
