import { test } from 'node:test';
import assert from 'node:assert/strict';
import { esAdmin, puedeEntrarAlAula, puedePublicarDudas } from './dudasAcceso.js';

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
