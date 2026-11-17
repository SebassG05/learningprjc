import { test } from 'node:test';
import assert from 'node:assert/strict';
import { accesoDelCurso, esAdmin, puedeEntrarAlAula, puedePublicarDudas } from './dudasAcceso.js';

test('esAdmin reconoce admin y superadmin', () => {
  assert.equal(esAdmin({ role: 'admin' }), true);
  assert.equal(esAdmin({ role: 'superadmin' }), true);
  assert.equal(esAdmin({ role: 'student' }), false);
  assert.equal(esAdmin(null), false);
});

test('puedeEntrarAlAula: inscrito, profesor o admin', () => {
  assert.equal(puedeEntrarAlAula({ enrolled: true }), true);
  assert.equal(puedeEntrarAlAula({ enrolled: false, access: { teacher: true } }), true);
  assert.equal(puedeEntrarAlAula({ enrolled: false, admin: true }), true);
  assert.equal(puedeEntrarAlAula({ enrolled: false, access: { level: 'full' } }), false);
  assert.equal(puedeEntrarAlAula({}), false);
});

test('puedePublicarDudas: edición abierta, profesor o admin; no en solo lectura', () => {
  assert.equal(puedePublicarDudas({ access: { level: 'full' } }), true);
  assert.equal(puedePublicarDudas({ access: { level: 'readonly', teacher: true } }), true);
  assert.equal(puedePublicarDudas({ access: { level: 'readonly' }, admin: true }), true);
  assert.equal(puedePublicarDudas({ access: { level: 'readonly' } }), false);
  assert.equal(puedePublicarDudas({}), false);
});

test('accesoDelCurso: usa access del backend; sin él, un curso público es full sin profesor', () => {
  const access = { level: 'readonly', reason: 'teacher', teacher: true };
  assert.equal(accesoDelCurso({ accessMode: 'private', access }), access);
  assert.equal(accesoDelCurso({ accessMode: 'public', access }), access);
  assert.deepEqual(accesoDelCurso({ accessMode: 'public' }), { level: 'full', teacher: false });
  assert.deepEqual(accesoDelCurso({}), { level: 'full', teacher: false });
  assert.equal(accesoDelCurso({ accessMode: 'private' }), undefined);
  assert.equal(accesoDelCurso(null), undefined);
});

test('accesoDelCurso + puedePublicarDudas: alumno de un curso público sin access puede publicar', () => {
  assert.equal(puedePublicarDudas({ access: accesoDelCurso({ accessMode: 'public' }) }), true);
  assert.equal(puedePublicarDudas({ access: accesoDelCurso({ accessMode: 'private' }) }), false);
});
