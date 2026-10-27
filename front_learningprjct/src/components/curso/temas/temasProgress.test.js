import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  CICLO, etapa, etapaDe, tituloTema, usaCiclo, CURSO_CICLO, formatSpeed, formatTime, markSeen, numerarApartados, pickQuality, prefersNativePdf,
  reachedSeen, readSeen, readTemaResume, saveTemaResume, seenKey, tieneEscenas, totalApartados,
} from './temasProgress.js';

// localStorage en memoria (y uno que lanza, como en Safari privado antiguo)
const memoryStorage = () => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
};
const throwingStorage = { getItem() { throw new Error('no'); }, setItem() { throw new Error('no'); }, removeItem() { throw new Error('no'); } };

describe('temas vistos', () => {
  beforeEach(() => { globalThis.localStorage = memoryStorage(); });

  test('marca y lee por curso', () => {
    markSeen('c1', 't1');
    markSeen('c1', 't2');
    markSeen('c1', 't1');
    assert.deepEqual([...readSeen('c1')], ['t1', 't2']);
    assert.equal(readSeen('c2').size, 0);
  });

  test('ignora valores corruptos y sobrevive sin almacenamiento', () => {
    localStorage.setItem(seenKey('c1'), '{roto');
    assert.equal(readSeen('c1').size, 0);
    localStorage.setItem(seenKey('c1'), '[1,"t3",null]');
    assert.deepEqual([...readSeen('c1')], ['t3']);
    globalThis.localStorage = throwingStorage;
    assert.equal(readSeen('c1').size, 0);
    assert.deepEqual([...markSeen('c1', 't9')], ['t9']);
  });

  test('cuenta como visto desde el 90 %', () => {
    assert.equal(reachedSeen(89, 100), false);
    assert.equal(reachedSeen(90, 100), true);
    assert.equal(reachedSeen(10, NaN), false);
    assert.equal(reachedSeen(10, 0), false);
  });
});

test('la posición se recuerda por tema, no por curso', () => {
  globalThis.localStorage = memoryStorage();
  saveTemaResume('c1', 't1', 120);
  assert.equal(readTemaResume('c1', 't1', 600), 120);
  assert.equal(readTemaResume('c1', 't2', 600), 0);
  assert.equal(readTemaResume('c1', 't1', 125), 0); // a menos de 10 s del final: empieza de nuevo
});

test('calidad: 720p en pantallas pequeñas, ahorro de datos o red lenta', () => {
  assert.equal(pickQuality({ width: 390 }), 'sd');
  assert.equal(pickQuality({ width: 900 }), 'sd');
  assert.equal(pickQuality({ width: 1440 }), 'hd');
  assert.equal(pickQuality({ width: 1440, saveData: true }), 'sd');
  assert.equal(pickQuality({ width: 1440, effectiveType: '3g' }), 'sd');
  assert.equal(pickQuality({ width: 1440, effectiveType: '4g' }), 'hd');
  assert.equal(pickQuality({}), 'hd');
});

test('formato de tiempo y velocidad', () => {
  assert.equal(formatTime(0), '0:00');
  assert.equal(formatTime(65.9), '1:05');
  assert.equal(formatTime(3725), '1:02:05');
  assert.equal(formatTime(NaN), '0:00');
  assert.equal(formatSpeed(1.25), '1,25×');
  assert.equal(formatSpeed(2), '2×');
});

test('índice con numeración continua', () => {
  const r = numerarApartados([{ titulo: 'A', items: ['a', 'b'] }, { titulo: 'B', items: ['c'] }, { titulo: 'C' }]);
  assert.deepEqual(r.map((a) => a.items.map((i) => i.n)), [[1, 2], [3], []]);
  assert.equal(totalApartados([{ items: ['a', 'b'] }, { items: ['c'] }, {}]), 3);
});

test('etapas del ciclo y detección del temario nuevo', () => {
  assert.equal(CICLO.length, 4);
  assert.equal(etapa(0).key, 'suelo');
  assert.equal(etapa(9).key, 'practica');
  assert.equal(etapa(-1).key, 'suelo');
  assert.equal(tieneEscenas([{ titulo: 'x' }]), false);
  assert.equal(tieneEscenas([{ titulo: 'x', apartados: [{ titulo: 'a' }] }]), true);
  assert.equal(tieneEscenas([{ video: { publicId: 'v' } }]), true);
  assert.equal(tieneEscenas(null), false);
});

test('etapas con nombre solo en Carbono; el resto alterna acentos', () => {
  assert.equal(usaCiclo(CURSO_CICLO), true);
  assert.equal(usaCiclo('otro'), false);
  assert.equal(etapaDe(2, true).es, 'Modelos');
  assert.equal(etapaDe(2, false).es, null);
  assert.equal(etapaDe(5, false).accent, CICLO[1].accent);
  assert.equal(etapaDe(9, true).key, 'practica');
});

test('título sin el prefijo «Tema NN:»', () => {
  assert.equal(tituloTema({ titulo: 'Tema 01: Introducción a ANFORA' }), 'Introducción a ANFORA');
  assert.equal(tituloTema({ titulo: 'Tema 01: X', tituloEn: 'Topic 01 - Y' }, 'en'), 'Y');
  assert.equal(tituloTema({ titulo: 'Presentaciones' }), 'Presentaciones');
  assert.equal(tituloTema({ titulo: 'Tema 3' }), 'Tema 3');
});

test('PDF nativo solo en táctil sin hover', () => {
  assert.equal(prefersNativePdf({ coarse: true, hoverNone: true }), true);
  assert.equal(prefersNativePdf({ coarse: true, hoverNone: false }), false);
  assert.equal(prefersNativePdf({ coarse: false, hoverNone: false }), false);
});
