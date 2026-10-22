import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { clearResume, readResume, resumeKey, saveResume } from './videoResume.js';

const memory = () => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
};
beforeEach(() => {
  globalThis.localStorage = memory();
});

test('guarda y recupera la posición del curso', () => {
  saveResume('c1', 125.7);
  assert.equal(readResume('c1', 600), 125.7);
  assert.equal(readResume('c2', 600), 0);
});

test('no reanuda al principio ni en los últimos 10 s', () => {
  saveResume('c1', 4);
  assert.equal(readResume('c1', 600), 0);
  saveResume('c1', 595);
  assert.equal(readResume('c1', 600), 0);
  saveResume('c1', 589);
  assert.equal(readResume('c1', 600), 589);
});

test('sin duración conocida reanuda igual si pasa del mínimo', () => {
  saveResume('c1', 30);
  assert.equal(readResume('c1', Number.NaN), 30);
});

test('un valor corrupto se ignora', () => {
  localStorage.setItem(resumeKey('c1'), 'abc');
  assert.equal(readResume('c1', 600), 0);
});

test('clearResume lo olvida', () => {
  saveResume('c1', 100);
  clearResume('c1');
  assert.equal(readResume('c1', 600), 0);
});

test('con localStorage bloqueado no rompe nada', () => {
  globalThis.localStorage = {
    getItem() { throw new Error('SecurityError'); },
    setItem() { throw new Error('QuotaExceeded'); },
    removeItem() { throw new Error('SecurityError'); },
  };
  assert.doesNotThrow(() => saveResume('c1', 100));
  assert.doesNotThrow(() => clearResume('c1'));
  assert.equal(readResume('c1', 600), 0);
});
