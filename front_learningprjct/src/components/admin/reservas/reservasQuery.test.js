// Reservas: filtros en la URL, calendario y agrupación por día. Ejecutar: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dayKey, groupByDay, listParams, monthParams, monthWeeks, parseMonth, reservasFilters } from './reservasQuery.js';

test('la URL se lee con valores por defecto e ignora lo inválido', () => {
  const f = reservasFilters.fromParams(new URLSearchParams('estado=cancelada&vista=calendario&mes=2026-13&dia=2026-10-03&q=ana'));
  assert.equal(f.estado, '');
  assert.equal(f.vista, 'calendario');
  assert.equal(f.mes, '');
  assert.equal(f.dia, '2026-10-03');
  assert.equal(f.q, 'ana');
});

test('vista, mes y día no cuentan como filtros activos y se conservan al limpiar', () => {
  const f = { ...reservasFilters.defaults, vista: 'calendario', mes: '2026-10', curso: 'a'.repeat(24) };
  assert.equal(reservasFilters.hasActive({ ...f, curso: '' }), false);
  assert.equal(reservasFilters.hasActive(f), true);
  assert.deepEqual(reservasFilters.cleared(f), { ...reservasFilters.defaults, vista: 'calendario', mes: '2026-10' });
});

test('parámetros de la lista', () => {
  const p = listParams({ ...reservasFilters.defaults, estado: 'completed' }, 3);
  assert.equal(p.page, 3);
  assert.equal(p.estado, 'completed');
  assert.equal(p.desde, undefined);
});

test('el mes del calendario va del día 1 a las 23:59:59 del último, en un solo pedido', () => {
  const first = parseMonth('2026-02');
  const p = monthParams(reservasFilters.defaults, first);
  assert.equal(new Date(p.desde).getDate(), 1);
  const hasta = new Date(p.hasta);
  assert.equal(hasta.getDate(), 28);
  assert.equal(hasta.getHours(), 23);
  assert.equal(p.limit, 500);
  assert.equal(p.orden, 'antiguas');
});

test('semanas de lunes a domingo con huecos fuera del mes', () => {
  const weeks = monthWeeks(parseMonth('2026-10')); // el 1 de octubre de 2026 es jueves
  assert.equal(weeks[0].slice(0, 3).every((d) => d === null), true);
  assert.equal(weeks[0][3].getDate(), 1);
  assert.ok(weeks.every((w) => w.length === 7));
  assert.equal(weeks.flat().filter(Boolean).length, 31);
});

test('agrupación por día local', () => {
  const a = new Date(2026, 9, 3, 9, 0);
  const b = new Date(2026, 9, 3, 22, 30);
  const c = new Date(2026, 9, 4, 0, 5);
  const g = groupByDay([{ enrolledAt: a }, { enrolledAt: b }, { enrolledAt: c }, { enrolledAt: 'x' }]);
  assert.equal(g[dayKey(a)].length, 2);
  assert.equal(g[dayKey(c)].length, 1);
  assert.equal(Object.keys(g).length, 2);
});
