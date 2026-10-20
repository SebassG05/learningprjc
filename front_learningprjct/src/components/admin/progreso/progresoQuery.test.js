// Progreso del curso: filas por alumno, cifras, distribución y avance por tema. Ejecutar: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FINAL_TEST_ID, filterAndSort, histogram, progresoFilters, sortedTopics, studentRow, summarize, topicCompletion } from './progresoQuery.js';

const course = { temas: [{ _id: 't2', numeroTema: 2, titulo: 'Dos' }, { _id: 't1', numeroTema: 1, titulo: 'Uno' }] };
const topics = sortedTopics(course);
const e = (name, progress, tests, entregas) => ({ userId: name ? `u-${name}` : null, name: name || 'N/A', email: name ? `${name}@x.es` : 'N/A', progress, completedTests: tests, entregas });
const rows = [
  e('Lucía', 100, ['t1', 't2', FINAL_TEST_ID], { total: 3, pendientes: 0, aprobadas: 3, media: 8.5 }),
  e('Álvaro', 45, ['t1'], { total: 2, pendientes: 2, aprobadas: 0, media: null }),
  e('pablo', 10, [], { total: 1, pendientes: 0, aprobadas: 1, media: 6 }),
  e(null, 0, [], undefined),
].map((x) => studentRow(x, topics, 4));

test('temas ordenados por número y flags por alumno', () => {
  assert.deepEqual(topics.map((t) => t._id), ['t1', 't2']);
  assert.deepEqual(rows[0].topicFlags, [true, true]);
  assert.equal(rows[1].topicsDone, 1);
  assert.equal(rows[0].finalDone, true);
  assert.equal(rows[3].delivered, 0);
});

test('cifras del curso: media de progreso, pendientes y nota media de quien tiene nota', () => {
  assert.deepEqual(summarize(rows), { students: 4, avgProgress: 39, completed: 1, pending: 2, avgGrade: 7.3 });
  assert.equal(summarize([]).avgGrade, null);
});

test('distribución en cinco tramos que suman el total', () => {
  const h = histogram(rows);
  assert.deepEqual(h.map((b) => b.count), [2, 0, 1, 0, 1]);
});

test('avance por tema incluye el test final', () => {
  const t = topicCompletion(rows, topics);
  assert.deepEqual(t.map((x) => [x.title, x.count, x.pct]), [['Uno', 2, 50], ['Dos', 1, 25], ['Test final', 1, 25]]);
});

test('búsqueda sin tildes ni mayúsculas y órdenes', () => {
  assert.equal(filterAndSort(rows, { q: 'alvaro', orden: 'progreso' }).length, 1);
  assert.deepEqual(filterAndSort(rows, { q: '', orden: 'nombre' }).map((r) => r.name), ['Álvaro', 'Lucía', 'pablo', 'N/A']);
  assert.equal(filterAndSort(rows, { q: '', orden: 'pendientes' })[0].name, 'Álvaro');
  assert.equal(filterAndSort(rows, { q: '', orden: 'nota' })[0].name, 'Lucía');
  assert.equal(filterAndSort(rows, { q: '', orden: 'menos' })[0].progress, 0);
});

test('el curso y el orden no cuentan como filtro activo', () => {
  assert.equal(progresoFilters.hasActive({ curso: 'a'.repeat(24), q: '', orden: 'nota' }), false);
  assert.equal(progresoFilters.hasActive({ curso: '', q: 'x', orden: 'progreso' }), true);
});

test('backend anterior: resumen de entregas por alumno calculado aquí', async () => {
  const { summarizeSubmissions } = await import('./progresoQuery.js');
  const m = summarizeSubmissions([
    { userId: { _id: 'u1' }, cursoId: { _id: 'c1' }, estado: 'aprobado', calificacion: 8 },
    { userId: { _id: 'u1' }, cursoId: { _id: 'c1' }, estado: 'rechazado', calificacion: 4 },
    { userId: { _id: 'u1' }, cursoId: { _id: 'c1' }, estado: 'enviado' },
    { userId: { _id: 'u1' }, cursoId: { _id: 'c2' }, estado: 'aprobado', calificacion: 10 },
    { userId: null, cursoId: { _id: 'c1' }, estado: 'enviado' },
  ], 'c1');
  assert.deepEqual(m.get('u1'), { total: 3, pendientes: 1, aprobadas: 1, media: 6, ultima: null });
  assert.equal(m.size, 1);
});
