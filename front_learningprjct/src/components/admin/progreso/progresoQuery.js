// Pestaña Progreso: filtros en la URL y cálculos sobre las inscripciones de un curso. Sin React.
import { createUrlFilters, isObjectId } from '../shared/urlFilters.js';

export const FINAL_TEST_ID = 'test-final-certificacion';

export const SORTS = [
  { value: 'progreso', label: 'Más avance' },
  { value: 'menos', label: 'Menos avance' },
  { value: 'pendientes', label: 'Con entregas pendientes' },
  { value: 'nota', label: 'Mejor nota media' },
  { value: 'nombre', label: 'Nombre (A–Z)' },
];

export const progresoFilters = createUrlFilters({
  defaults: { curso: '', q: '', orden: 'progreso' },
  valid: { curso: isObjectId, orden: (v) => SORTS.some((s) => s.value === v) },
  ignore: ['curso', 'orden'],
});

const deleted = (e) => !e.userId;
export const displayName = (e) => (deleted(e) ? '' : e.name && e.name !== 'N/A' ? e.name : e.email);

// Temas ordenados por número; el test final va aparte
export const sortedTopics = (course) => [...(course?.temas ?? [])].sort((a, b) => (a.numeroTema ?? 0) - (b.numeroTema ?? 0));

// Lo que se pinta de cada alumno
export function studentRow(e, topics, exercises) {
  const done = new Set(e.completedTests ?? []);
  const topicsDone = topics.filter((t) => done.has(String(t._id))).length;
  const s = e.entregas ?? { total: 0, pendientes: 0, aprobadas: 0, media: null };
  return {
    ...e,
    progress: Math.max(0, Math.min(100, Math.round(Number(e.progress) || 0))),
    topicsDone,
    topicsTotal: topics.length,
    topicFlags: topics.map((t) => done.has(String(t._id))),
    finalDone: done.has(FINAL_TEST_ID),
    delivered: s.total,
    pending: s.pendientes,
    approved: s.aprobadas,
    average: typeof s.media === 'number' ? s.media : null,
    exercises,
  };
}

const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

// Cifras del curso: la nota media es la media de las medias de quien tiene alguna nota
export function summarize(rows) {
  return {
    students: rows.length,
    avgProgress: rows.length ? Math.round(mean(rows.map((r) => r.progress))) : null,
    completed: rows.filter((r) => r.progress >= 100 || r.status === 'completed').length,
    pending: rows.reduce((a, r) => a + r.pending, 0),
    avgGrade: (() => {
      const m = mean(rows.filter((r) => r.average !== null).map((r) => r.average));
      return m === null ? null : Math.round(m * 10) / 10;
    })(),
  };
}

// Distribución del progreso en cinco tramos
export const BANDS = [
  { label: '0–19 %', min: 0, max: 19 },
  { label: '20–39 %', min: 20, max: 39 },
  { label: '40–59 %', min: 40, max: 59 },
  { label: '60–79 %', min: 60, max: 79 },
  { label: '80–100 %', min: 80, max: 100 },
];
export const histogram = (rows) => BANDS.map((b) => ({ ...b, count: rows.filter((r) => r.progress >= b.min && r.progress <= b.max).length }));

// Cuántos alumnos han superado el test de cada tema (y el final)
export function topicCompletion(rows, topics) {
  const n = rows.length;
  const items = topics.map((t, i) => {
    const count = rows.filter((r) => r.topicFlags[i]).length;
    return { key: String(t._id), number: t.numeroTema, title: t.titulo || t.tituloEn || `Tema ${t.numeroTema}`, count, pct: n ? Math.round((count / n) * 100) : 0 };
  });
  const finals = rows.filter((r) => r.finalDone).length;
  items.push({ key: FINAL_TEST_ID, number: null, title: 'Test final', count: finals, pct: n ? Math.round((finals / n) * 100) : 0 });
  return items;
}

const collator = new Intl.Collator('es', { sensitivity: 'base' });
const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function filterAndSort(rows, { q, orden }) {
  const needle = norm(q.trim());
  const list = needle ? rows.filter((r) => norm(`${r.name} ${r.email}`).includes(needle)) : [...rows];
  // Los alumnos eliminados (sin nombre) siempre al final
  const byName = (a, b) => {
    const na = displayName(a);
    const nb = displayName(b);
    if (!na || !nb) return (na ? 0 : 1) - (nb ? 0 : 1);
    return collator.compare(na, nb);
  };
  const cmp = {
    progreso: (a, b) => b.progress - a.progress || byName(a, b),
    menos: (a, b) => a.progress - b.progress || byName(a, b),
    pendientes: (a, b) => b.pending - a.pending || byName(a, b),
    nota: (a, b) => (b.average ?? -1) - (a.average ?? -1) || byName(a, b),
    nombre: byName,
  }[orden] ?? byName;
  return list.sort(cmp);
}

// Alumno con la forma que espera StudentIdentity (null si la cuenta ya no existe)
export const rowUser = (r) => (r.userId ? { name: r.name !== 'N/A' ? r.name : '', email: r.email } : null);

// ---- Compatibilidad con el backend anterior ----
// Sin el resumen por alumno en las inscripciones, se calcula con todas las entregas (mismas reglas
// que service/progresoService.js: la media ignora las entregas sin nota).
export function summarizeSubmissions(entregas, courseId) {
  const map = new Map();
  entregas.forEach((e) => {
    if (String(e.cursoId?._id ?? e.cursoId) !== String(courseId)) return;
    const uid = e.userId?._id ?? e.userId;
    if (!uid) return;
    const s = map.get(String(uid)) ?? { total: 0, pendientes: 0, aprobadas: 0, notas: [] };
    s.total += 1;
    if (e.estado === 'enviado') s.pendientes += 1;
    if (e.estado === 'aprobado') s.aprobadas += 1;
    if (typeof e.calificacion === 'number') s.notas.push(e.calificacion);
    map.set(String(uid), s);
  });
  const out = new Map();
  map.forEach(({ notas, ...s }, uid) => {
    out.set(uid, { ...s, media: notas.length ? Math.round((notas.reduce((a, b) => a + b, 0) / notas.length) * 100) / 100 : null, ultima: null });
  });
  return out;
}
