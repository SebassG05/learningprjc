// Filtros del listado de entregas: URL ⇄ filtros ⇄ API. Ejecutar: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { apiParams, filtersFromParams, hasActiveFilters, paramsFromFilters, shiftStats } from './submissionQuery.js';

test('la URL se lee con valores por defecto e ignora lo inválido', () => {
  const f = filtersFromParams(new URLSearchParams('estado=aprobado&orden=azar&curso=xyz&fecha=7d&q=pablo'));
  assert.deepEqual(f, { q: 'pablo', estado: 'aprobado', curso: '', fecha: '7d', orden: 'prioridad' });
});

test('a la URL solo va lo que no es por defecto, y se conserva la pestaña', () => {
  const p = paramsFromFilters({ q: '', estado: 'enviado', curso: '', fecha: '', orden: 'prioridad' }, new URLSearchParams('tab=correcciones&q=x'));
  assert.equal(p.toString(), 'tab=correcciones&estado=enviado');
});

test('ordenar no cuenta como filtro activo', () => {
  assert.equal(hasActiveFilters({ q: '', estado: '', curso: '', fecha: '', orden: 'nota' }), false);
  assert.equal(hasActiveFilters({ q: 'a', estado: '', curso: '', fecha: '', orden: 'prioridad' }), true);
});

test('parámetros de la API: página, tamaño y fecha desde el preset', () => {
  const now = Date.parse('2026-10-19T12:00:00Z');
  const p = apiParams({ q: '', estado: '', curso: '', fecha: '7d', orden: 'prioridad' }, 2, now);
  assert.equal(p.page, 2);
  assert.equal(p.limit, 20);
  assert.equal(p.desde, '2026-10-12T12:00:00.000Z');
  assert.equal(p.q, undefined);
});

test('las cifras se desplazan de un estado a otro sin bajar de cero', () => {
  assert.deepEqual(shiftStats({ enviado: 1, aprobado: 0, total: 1 }, 'enviado', 'aprobado'), { enviado: 0, aprobado: 1, total: 1 });
  assert.deepEqual(shiftStats({ enviado: 0, aprobado: 0 }, 'enviado', 'aprobado'), { enviado: 0, aprobado: 1 });
});
