// Filtros, calendario y agrupación por día de las inscripciones (pestaña Reservas). Sin React.
import { createUrlFilters, isDatePreset, isObjectId, presetSince } from '../shared/urlFilters.js';

export const PAGE_SIZE = 20;
export const ENROLLMENT_STATUS = {
  enrolled: { label: 'En curso', tone: 'neutral' },
  completed: { label: 'Completado', tone: 'brand' },
};

export const SORTS = [
  { value: 'recientes', label: 'Más recientes' },
  { value: 'antiguas', label: 'Más antiguas' },
  { value: 'progreso', label: 'Más avance' },
];

const isMonth = (v) => /^\d{4}-(0[1-9]|1[0-2])$/.test(v);
const isDay = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v));

export const reservasFilters = createUrlFilters({
  defaults: { q: '', curso: '', estado: '', fecha: '', orden: 'recientes', vista: 'lista', mes: '', dia: '' },
  valid: {
    curso: isObjectId,
    estado: (v) => v in ENROLLMENT_STATUS,
    fecha: isDatePreset,
    orden: (v) => SORTS.some((s) => s.value === v),
    vista: (v) => v === 'lista' || v === 'calendario',
    mes: isMonth,
    dia: isDay,
  },
  ignore: ['orden', 'vista', 'mes', 'dia'],
});

export function listParams(f, page, now = Date.now()) {
  return {
    page,
    limit: PAGE_SIZE,
    orden: f.orden,
    q: f.q || undefined,
    curso: f.curso || undefined,
    estado: f.estado || undefined,
    desde: presetSince(f.fecha, now),
  };
}

// ---- Fechas locales (el calendario es del huso del navegador) ----
const pad = (n) => String(n).padStart(2, '0');
export const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const monthKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
export const parseMonth = (key, fallback = new Date()) => {
  if (!isMonth(key)) return new Date(fallback.getFullYear(), fallback.getMonth(), 1);
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1);
};
export const parseDay = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const addMonths = (first, n) => new Date(first.getFullYear(), first.getMonth() + n, 1);

// Mes completo para la vista de calendario: un solo pedido (hasta 500), en orden cronológico
export function monthParams(f, first) {
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0, 23, 59, 59, 999);
  return {
    page: 1,
    limit: 500,
    orden: 'antiguas',
    q: f.q || undefined,
    curso: f.curso || undefined,
    estado: f.estado || undefined,
    desde: first.toISOString(),
    hasta: last.toISOString(),
  };
}

// Semanas del mes (lunes a domingo); los días de fuera del mes son null
export function monthWeeks(first) {
  const offset = (first.getDay() + 6) % 7; // lunes = 0
  const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells = [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => new Date(first.getFullYear(), first.getMonth(), i + 1))];
  while (cells.length % 7) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
}

// { 'AAAA-MM-DD': [inscripción, …] } con la fecha local de la inscripción
export function groupByDay(items) {
  const map = {};
  items.forEach((x) => {
    const d = new Date(x.enrolledAt);
    if (!Number.isFinite(d.getTime())) return;
    (map[dayKey(d)] ||= []).push(x);
  });
  return map;
}
