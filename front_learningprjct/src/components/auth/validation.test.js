// node --test src/components/auth/validation.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { googleButtonWidth, fieldMessage, firstInvalid, passwordMatch } from './validation.js';

const ok = { validity: { valid: true }, validationMessage: '' };
const bad = (msg = 'Rellena este campo.') => ({ validity: { valid: false }, validationMessage: msg });

test('googleButtonWidth respeta los límites de Google (200–400 px)', () => {
  assert.equal(googleButtonWidth(150), 200);
  assert.equal(googleButtonWidth(320.4), 320);
  assert.equal(googleButtonWidth(900), 400);
});

test('googleButtonWidth usa 400 si la medida no es un número', () => {
  assert.equal(googleButtonWidth(NaN), 400);
  assert.equal(googleButtonWidth(undefined), 400);
});

test('fieldMessage está vacío si el campo es válido', () => {
  assert.equal(fieldMessage({ validity: { valid: true }, validationMessage: 'x' }), '');
});

test('fieldMessage devuelve el mensaje de la validación nativa', () => {
  assert.equal(fieldMessage(bad()), 'Rellena este campo.');
});

test('firstInvalid devuelve el primer campo inválido en orden', () => {
  const b1 = bad();
  const b2 = bad();
  assert.equal(firstInvalid({ elements: [ok, b1, b2] }), b1);
});

test('firstInvalid ignora elementos sin validez (fieldset, botones sin validity)', () => {
  assert.equal(firstInvalid({ elements: [{}, ok] }), null);
});

test('passwordMatch no dice nada mientras "Repetir" está vacío', () => {
  assert.equal(passwordMatch('secreto', ''), null);
  assert.equal(passwordMatch('', ''), null);
});

test('passwordMatch distingue coincidencia y diferencia', () => {
  assert.equal(passwordMatch('secreto', 'secreto'), 'match');
  assert.equal(passwordMatch('secreto', 'secret'), 'mismatch');
});
