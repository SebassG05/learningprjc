// node --test src/components/auth/loadAuthModal.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createLoader } from './loadAuthModal.js';

test('createLoader comparte una sola descarga entre precarga y apertura', async () => {
  let calls = 0;
  const load = createLoader(async () => { calls += 1; return 'mod'; });
  assert.equal(await load(), 'mod');
  assert.equal(await load(), 'mod');
  assert.equal(calls, 1);
});

test('createLoader reintenta si la descarga falla (sin conexión o chunk de un despliegue anterior)', async () => {
  let calls = 0;
  const load = createLoader(async () => {
    calls += 1;
    if (calls === 1) throw new Error('chunk');
    return 'mod';
  });
  await assert.rejects(load());
  assert.equal(await load(), 'mod');
  assert.equal(calls, 2);
});
