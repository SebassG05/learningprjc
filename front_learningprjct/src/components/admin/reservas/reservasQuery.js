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

// ---- Compatibilidad con el backend anterior ----
// Sin /api/users/admin/enrollments (404), la lista se arma con el endpoint por curso y se filtra,
// ordena y pagina aquí con las mismas reglas que el servidor nuevo.
export function legacyRows(perCourse) {
  return perCourse.flatMap(({ course, enrollments }) =>
    (enrollments ?? []).map((e) => ({
      _id: `${e.userId ?? 'sin-alumno'}-${course._id}-${e.enrolledAt}`,
      userId: e.userId ? { _id: e.userId, name: e.name !== 'N/A' ? e.name : '', email: e.email !== 'N/A' ? e.email : '' } : null,
      courseId: { _id: course._id, title: course.title, titleEn: course.titleEn },
      status: e.status ?? 'enrolled',
      progress: e.progress ?? 0,
      enrolledAt: e.enrolledAt,
    }))
  );
}

const fold = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// `range` = { desde, hasta } (ISO) para el calendario; si no, el preset de fecha de los filtros
export function legacyEnrollmentPage(all, f, page, { range, limit = PAGE_SIZE, now = Date.now() } = {}) {
  const desde = range?.desde ?? presetSince(f.fecha, now);
  const hasta = range?.hasta;
  const q = fold(f.q.trim());
  const base = all.filter((x) => {
    if (f.curso && x.courseId?._id !== f.curso) return false;
    if (desde && x.enrolledAt < desde) return false;
    if (hasta && x.enrolledAt > hasta) return false;
    return !q || [x.userId?.name, x.userId?.email, x.courseId?.title, x.courseId?.titleEn].some((v) => fold(v).includes(q));
  });
  const stats = { enrolled: 0, completed: 0 };
  base.forEach((x) => {
    if (x.status in stats) stats[x.status] += 1;
  });
  stats.total = base.length;
  const list = f.estado ? base.filter((x) => x.status === f.estado) : base;
  const t = (x) => new Date(x.enrolledAt).getTime() || 0;
  const orden = range ? 'antiguas' : f.orden;
  const cmp = { recientes: (a, b) => t(b) - t(a), antiguas: (a, b) => t(a) - t(b), progreso: (a, b) => b.progress - a.progress || t(b) - t(a) }[orden];
  const sorted = [...list].sort(cmp);
  return { items: sorted.slice((page - 1) * limit, page * limit), stats, total: sorted.length, page, pages: Math.max(1, Math.ceil(sorted.length / limit)) };
}
