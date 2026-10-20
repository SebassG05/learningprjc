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

// ---- Compatibilidad con el backend anterior ----
// Sin parámetros de listado, el backend antiguo devuelve todas las entregas ({ entregas }) sin total
// ni cifras. Mientras convivan las dos versiones (despliegue), se filtra, ordena y pagina aquí con
// las mismas reglas que el servidor nuevo (service/entregasQueryService.js).
const fold = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const time = (e) => new Date(e.fechaEntrega).getTime() || 0;

export function legacyPage(all, filters, page, courseTitle = () => '', now = Date.now()) {
  const desde = presetSince(filters.fecha, now);
  const q = fold(filters.q.trim());
  const base = all.filter((e) => {
    if (filters.curso && String(e.cursoId?._id ?? e.cursoId) !== filters.curso) return false;
    if (desde && time(e) < Date.parse(desde)) return false;
    if (!q) return true;
    return [e.userId?.name, e.userId?.email, e.ejercicioId?.titulo, e.cursoId?.title, courseTitle(e)].some((v) => fold(v).includes(q));
  });
  const stats = { enviado: 0, revisado: 0, aprobado: 0, rechazado: 0 };
  base.forEach((e) => {
    if (e.estado in stats) stats[e.estado] += 1;
  });
  stats.total = base.length;
  const list = filters.estado ? base.filter((e) => e.estado === filters.estado) : base;
  const pending = (e) => (e.estado === 'enviado' ? 0 : 1);
  const cmp = {
    prioridad: (a, b) => pending(a) - pending(b) || (pending(a) === 0 ? time(a) - time(b) : time(b) - time(a)),
    recientes: (a, b) => time(b) - time(a),
    antiguas: (a, b) => time(a) - time(b),
    nota: (a, b) => (typeof b.calificacion === 'number' ? b.calificacion : -1) - (typeof a.calificacion === 'number' ? a.calificacion : -1) || time(b) - time(a),
  }[filters.orden] ?? (() => 0);
  const sorted = [...list].sort(cmp);
  return {
    items: sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    stats,
    total: sorted.length,
    page,
    pages: Math.max(1, Math.ceil(sorted.length / PAGE_SIZE)),
  };
}
