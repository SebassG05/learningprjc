// node --test src/components/globe/journey/store.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { journey, setOverlay, subscribe } from './store.js';

test('setOverlay marca el diálogo abierto y avisa una sola vez por cambio', () => {
  let calls = 0;
  const off = subscribe(() => { calls += 1; });
  assert.equal(journey.overlay, false);
  setOverlay(true);
  setOverlay(true);
  assert.equal(journey.overlay, true);
  assert.equal(calls, 1);
  setOverlay(false);
  assert.equal(journey.overlay, false);
  assert.equal(calls, 2);
  off();
});
