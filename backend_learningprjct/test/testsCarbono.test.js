// Tests de evaluación de Carbono (src/data): forma de los JSON, carga en Mongo con el esquema real y
// corrección. La explicación solo debe salir al validar, nunca con las preguntas.
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const { startMemoryMongo } = await import('./helpers/memoryMongo.js');
const { default: Test } = await import('../src/models/Test.js');
const { obtenerTestPorTema, validarRespuestas } = await import('../src/controller/testController.js');

const CURSO = '69d50406663e8648d7ee1f08';
const ARCHIVOS = {
  'test-tema1-introduccion.json': '69d5f26894dace2e10adae38',
  'test-tema2-dinamica-equilibrio.json': '69d5f26894dace2e10adae3a',
  'test-tema3-modelos-ensemble.json': '69d5f26894dace2e10adae3c',
  'test-tema4-ejecucion-practica.json': '69d5f26894dace2e10adae3e',
  'test-final-certificacion.json': 'test-final-certificacion',
};
const leer = (f) => JSON.parse(readFileSync(new URL(`../src/data/${f}`, import.meta.url), 'utf-8'));

function llamar(fn, params, body) {
  return new Promise((resolve) => {
    const res = {
      statusCode: 200,
      status(c) { this.statusCode = c; return this; },
      json(data) { resolve({ status: this.statusCode, data }); },
    };
    fn({ params, body, headers: {} }, res);
  });
}

describe('JSON de los tests de Carbono', () => {
  for (const [archivo, temaId] of Object.entries(ARCHIVOS)) {
    test(`${archivo}: IDs reales, ≤ 30 preguntas de 4 opciones con una correcta y explicación`, () => {
      const t = leer(archivo);
      assert.equal(t.cursoId, CURSO);
      assert.equal(t.temaId, temaId);
      assert.ok(t.preguntas.length >= 20 && t.preguntas.length <= 30, `${t.preguntas.length} preguntas`);
      t.preguntas.forEach((p, i) => {
        assert.equal(p.numero, i + 1);
        assert.deepEqual(p.opciones.map((o) => o.id), ['a', 'b', 'c', 'd']);
        assert.equal(new Set(p.opciones.map((o) => o.texto)).size, 4);
        assert.ok(['a', 'b', 'c', 'd'].includes(p.respuestaCorrecta));
        assert.ok(p.explicacion?.length > 20);
        assert.equal(p.preguntaEn, undefined);
      });
      const cuenta = {};
      for (const p of t.preguntas) cuenta[p.respuestaCorrecta] = (cuenta[p.respuestaCorrecta] ?? 0) + 1;
      for (const n of Object.values(cuenta)) assert.ok(n >= 6 && n <= 9, JSON.stringify(cuenta));
    });
  }
});

describe('carga y corrección', () => {
  let mongo;
  before(async () => {
    mongo = await startMemoryMongo();
    for (const f of Object.keys(ARCHIVOS)) await Test.create(leer(f));
  });
  after(() => mongo.stop());

  for (const [archivo, temaId] of Object.entries(ARCHIVOS)) {
    test(`${archivo}: se sirve sin solución ni explicación y se corrige con explicación`, async () => {
      const original = leer(archivo);
      const params = { cursoId: CURSO, temaId };

      const { status, data } = await llamar(obtenerTestPorTema, params);
      assert.equal(status, 200);
      assert.equal(data.preguntas.length, original.preguntas.length);
      for (const p of data.preguntas) {
        assert.equal(p.respuestaCorrecta, undefined);
        assert.equal(p.explicacion, undefined);
      }

      const todas = original.preguntas.map((p) => ({ numero: p.numero, respuesta: p.respuestaCorrecta }));
      const ok = await llamar(validarRespuestas, params, { respuestas: todas });
      assert.equal(ok.data.nota, 100);
      assert.equal(ok.data.aprobado, true);
      assert.equal(ok.data.resultados[0].explicacion, original.preguntas[0].explicacion);

      const mal = original.preguntas.map((p) => ({ numero: p.numero, respuesta: p.respuestaCorrecta === 'a' ? 'b' : 'a' }));
      const ko = await llamar(validarRespuestas, params, { respuestas: mal });
      assert.equal(ko.data.correctas, 0);
      assert.equal(ko.data.aprobado, false);
    });
  }
});
