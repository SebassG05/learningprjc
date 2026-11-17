import { test } from 'node:test';
import assert from 'node:assert/strict';
import { takeTokenFromUrl, clearStoredToken, emailCoincide } from './inviteToken.js';

const fakeStorage = (init = {}) => {
  const data = { ...init };
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = String(v);
    },
    removeItem: (k) => {
      delete data[k];
    },
    data,
  };
};
const fakeHistory = () => {
  const calls = [];
  return { calls, replaceState: (...args) => calls.push(args) };
};
const loc = (hash, search = '') => ({ pathname: '/profesor/invitacion', search, hash });

test('quita el token de la URL con replaceState', () => {
  const storage = fakeStorage();
  const history = fakeHistory();
  const token = takeTokenFromUrl(loc('#token=abc123', '?x=1'), history, storage);
  assert.equal(token, 'abc123');
  assert.deepEqual(history.calls, [[null, '', '/profesor/invitacion?x=1']]);
  assert.equal(storage.getItem('profesor-invitacion-token'), 'abc123');
});

test('sin token en la URL devuelve el guardado', () => {
  const storage = fakeStorage({ 'profesor-invitacion-token': 'guardado' });
  const history = fakeHistory();
  assert.equal(takeTokenFromUrl(loc(''), history, storage), 'guardado');
  assert.equal(history.calls.length, 0);
  assert.equal(takeTokenFromUrl(loc('#otro=1'), history, fakeStorage()), null);
});

test('clearStoredToken borra el guardado', () => {
  const storage = fakeStorage({ 'profesor-invitacion-token': 'x' });
  clearStoredToken(storage);
  assert.equal(storage.getItem('profesor-invitacion-token'), null);
});

test('sin sessionStorage disponible no falla', () => {
  const broken = {
    getItem: () => {
      throw new Error('blocked');
    },
    setItem: () => {
      throw new Error('blocked');
    },
    removeItem: () => {
      throw new Error('blocked');
    },
  };
  assert.equal(takeTokenFromUrl(loc('#token=t'), fakeHistory(), broken), 't');
  assert.equal(takeTokenFromUrl(loc(''), fakeHistory(), broken), null);
  clearStoredToken(broken);
});

test('emailCoincide compara inicial y dominio del correo enmascarado', () => {
  assert.equal(emailCoincide('l•••@uco.es', 'Lucia@UCO.es'), true);
  assert.equal(emailCoincide('l•••@uco.es', 'marta@uco.es'), false);
  assert.equal(emailCoincide('l•••@uco.es', 'lucia@gmail.com'), false);
  assert.equal(emailCoincide('', 'lucia@uco.es'), false);
});
