import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pendingInviteStore } from './pendingInvite.js';

const memory = () => {
  const data = new Map();
  return { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, String(v)), removeItem: (k) => data.delete(k) };
};

test('el token de la URL se guarda y se recupera para ese curso', () => {
  const store = pendingInviteStore(memory());
  assert.equal(store.take('c1', 'tok'), 'tok');
  assert.equal(store.take('c1', null), 'tok');
});

test('sin token en la URL ni guardado → null', () => {
  assert.equal(pendingInviteStore(memory()).take('c1', null), null);
});

test('un token guardado de otro curso no se usa', () => {
  const store = pendingInviteStore(memory());
  store.take('c1', 'tok');
  assert.equal(store.take('c2', null), null);
});

test('clear lo olvida', () => {
  const store = pendingInviteStore(memory());
  store.take('c1', 'tok');
  store.clear();
  assert.equal(store.take('c1', null), null);
});

test('sin almacenamiento (modo privado estricto) sigue funcionando con el token de la URL', () => {
  const broken = { getItem: () => { throw new Error('no'); }, setItem: () => { throw new Error('no'); }, removeItem: () => { throw new Error('no'); } };
  const store = pendingInviteStore(broken);
  assert.equal(store.take('c1', 'tok'), 'tok');
  assert.equal(store.take('c1', null), null);
  store.clear();
});
