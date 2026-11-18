import test from 'node:test';
import assert from 'node:assert/strict';
import { tiempoRelativo, contarNuevas, agruparPorCurso, temaLabel } from './dudasFormat.js';

const now = new Date('2026-11-17T12:00:00Z');
const ago = (ms) => new Date(now.getTime() - ms);
const MIN = 60000;
const H = 60 * MIN;
const D = 24 * H;

test('tiempoRelativo en español', () => {
  assert.equal(tiempoRelativo(ago(10 * 1000), 'es', now), 'hace un momento');
  assert.equal(tiempoRelativo(ago(5 * MIN), 'es', now), 'hace 5 min');
  assert.equal(tiempoRelativo(ago(3 * H), 'es', now), 'hace 3 h');
  assert.equal(tiempoRelativo(ago(D), 'es', now), 'hace 1 día');
  assert.equal(tiempoRelativo(ago(2 * D + H), 'es', now), 'hace 2 días');
});

test('tiempoRelativo en inglés', () => {
  assert.equal(tiempoRelativo(ago(1000), 'en', now), 'just now');
  assert.equal(tiempoRelativo(ago(7 * MIN), 'en', now), '7 min ago');
  assert.equal(tiempoRelativo(ago(3 * H), 'en', now), '3 h ago');
  assert.equal(tiempoRelativo(ago(D), 'en', now), '1 day ago');
  assert.equal(tiempoRelativo(ago(4 * D), 'en', now), '4 days ago');
});

test('tiempoRelativo tolera fechas futuras, cadenas ISO e inválidas', () => {
  assert.equal(tiempoRelativo(new Date(now.getTime() + H), 'es', now), 'hace un momento');
  assert.equal(tiempoRelativo(ago(2 * H).toISOString(), 'es', now), 'hace 2 h');
  assert.equal(tiempoRelativo('nope', 'es', now), '');
});

test('contarNuevas cuenta solo las propias con respuesta sin ver', () => {
  const dudas = [
    { mine: true, respuestaNoVista: true },
    { mine: true, respuestaNoVista: false },
    { mine: false, respuestaNoVista: true },
    { mine: true },
    { mine: true, respuestaNoVista: true },
  ];
  assert.equal(contarNuevas(dudas), 2);
  assert.equal(contarNuevas(undefined), 0);
});

test('agruparPorCurso mantiene el orden de llegada', () => {
  const a = { _id: 'a', curso: { _id: 'c2' } };
  const b = { _id: 'b', curso: { _id: 'c1' } };
  const c = { _id: 'c', curso: { _id: 'c2' } };
  const out = agruparPorCurso([a, b, c]);
  assert.deepEqual(out.map((g) => g.curso._id), ['c2', 'c1']);
  assert.deepEqual(out[0].dudas, [a, c]);
  assert.deepEqual(out[1].dudas, [b]);
});

test('temaLabel', () => {
  const temas = [
    { _id: 't1', numeroTema: 2, titulo: 'Suelos', tituloEn: 'Soils' },
    { _id: 't2', numeroTema: 3, titulo: 'Solo ES' },
  ];
  assert.equal(temaLabel('general', temas, 'es'), 'General');
  assert.equal(temaLabel('general', temas, 'en'), 'General');
  assert.equal(temaLabel('t1', temas, 'es'), 'Tema 2 · Suelos');
  assert.equal(temaLabel('t1', temas, 'en'), 'Tema 2 · Soils');
  assert.equal(temaLabel('t2', temas, 'en'), 'Tema 3 · Solo ES');
  assert.equal(temaLabel('zzz', temas, 'es'), 'Tema');
});
