// Filtros del listado de entregas: URL ⇄ filtros ⇄ API. Ejecutar: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apiParams, filtersFromParams, hasActiveFilters, paramsFromFilters, submissionFilters } from './submissionQuery.js';

test('la URL se lee con valores por defecto e ignora lo inválido', () => {
  const f = filtersFromParams(new URLSearchParams('estado=aprobado&orden=azar&curso=xyz&fecha=7d&q=pablo'));
  assert.deepEqual(f, { q: 'pablo', estado: 'aprobado', curso: '', fecha: '7d', orden: 'prioridad' });
});

test('a la URL solo va lo que no es por defecto, y se conserva la pestaña', () => {
  const p = paramsFromFilters({ q: '', estado: 'enviado', curso: '', fecha: '', orden: 'prioridad' }, new URLSearchParams('tab=correcciones&q=x'));
  assert.equal(p.toString(), 'tab=correcciones&estado=enviado');
});

test('ordenar no cuenta como filtro activo y se conserva al limpiar', () => {
  assert.equal(hasActiveFilters({ q: '', estado: '', curso: '', fecha: '', orden: 'nota' }), false);
  assert.equal(hasActiveFilters({ q: 'a', estado: '', curso: '', fecha: '', orden: 'prioridad' }), true);
  assert.deepEqual(submissionFilters.cleared({ q: 'a', estado: 'enviado', curso: '', fecha: '7d', orden: 'nota' }), {
    q: '', estado: '', curso: '', fecha: '', orden: 'nota',
  });
});

test('parámetros de la API: página, tamaño y fecha desde el preset', () => {
  const now = Date.parse('2026-10-19T12:00:00Z');
  const p = apiParams({ q: '', estado: '', curso: '', fecha: '7d', orden: 'prioridad' }, 2, now);
  assert.equal(p.page, 2);
  assert.equal(p.limit, 20);
  assert.equal(p.desde, '2026-10-12T12:00:00.000Z');
  assert.equal(p.q, undefined);
});

test('backend anterior: filtra, cuenta, ordena por prioridad y pagina en el navegador', async () => {
  const { legacyPage } = await import('./submissionQuery.js');
  const d = (n) => new Date(Date.UTC(2026, 9, n)).toISOString();
  const all = [
    { _id: 'a', estado: 'aprobado', calificacion: 8, fechaEntrega: d(5), userId: { name: 'Lucía' }, cursoId: { _id: 'c1' } },
    { _id: 'b', estado: 'enviado', fechaEntrega: d(3), userId: { name: 'Pablo' }, cursoId: { _id: 'c1' } },
    { _id: 'c', estado: 'enviado', fechaEntrega: d(1), userId: null, cursoId: { _id: 'c2' } },
    { _id: 'd', estado: 'rechazado', calificacion: 3, fechaEntrega: d(4), userId: { name: 'lucia' }, cursoId: { _id: 'c2' } },
  ];
  const f = { q: '', estado: '', curso: '', fecha: '', orden: 'prioridad' };
  const r = legacyPage(all, f, 1);
  assert.deepEqual(r.items.map((x) => x._id), ['c', 'b', 'a', 'd']);
  assert.deepEqual(r.stats, { enviado: 2, revisado: 0, aprobado: 1, rechazado: 1, total: 4 });
  assert.equal(r.pages, 1);
  const s = legacyPage(all, { ...f, q: 'LUCIA', estado: 'aprobado' }, 1);
  assert.equal(s.total, 1);
  assert.equal(s.stats.total, 2);
  assert.equal(legacyPage(all, { ...f, curso: 'c2' }, 1).total, 2);
  // El título del curso que no llega (populate antiguo) se busca con el resolvedor
  assert.equal(legacyPage(all, { ...f, q: 'carbono' }, 1, (e) => (e.cursoId._id === 'c2' ? 'Carbono' : '')).total, 2);
});
