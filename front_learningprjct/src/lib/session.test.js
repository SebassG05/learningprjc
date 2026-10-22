import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sessionCheckResult } from './session.js';

test('401 de /me: el token ya no vale (caducado o inválido) → cerrar sesión', () => {
  assert.equal(sessionCheckResult({ status: 401 }), 'expired');
});

test('200 → sesión válida', () => {
  assert.equal(sessionCheckResult({ status: 200 }), 'valid');
});

test('error de red o del servidor → se conserva la sesión guardada', () => {
  assert.equal(sessionCheckResult(null), 'unknown');
  assert.equal(sessionCheckResult({ status: 500 }), 'unknown');
  assert.equal(sessionCheckResult({ status: 503 }), 'unknown');
});

test('token guardado como «undefined» o «null» (sesiones rotas de antes) → cerrar sesión sin preguntar', () => {
  assert.equal(sessionCheckResult(null, 'undefined'), 'expired');
  assert.equal(sessionCheckResult(null, 'null'), 'expired');
});
