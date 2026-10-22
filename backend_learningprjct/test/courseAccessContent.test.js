// Control de acceso en ejercicios, tests, entregas y progreso (Mongo real en memoria).
import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

process.env.JWT_SECRET = 'x'.repeat(40);

const { startMemoryMongo } = await import('./helpers/memoryMongo.js');
const fx = await import('./helpers/cohortFixtures.js');
const { default: Ejercicio } = await import('../src/models/Ejercicio.js');
const { default: EntregaEjercicio } = await import('../src/models/EntregaEjercicio.js');
const { default: Test } = await import('../src/models/Test.js');
const { default: UserProgress } = await import('../src/models/UserProgress.js');
const { default: ejercicioRoutes } = await import('../src/routes/ejercicio.routes.js');
const { default: testRoutes } = await import('../src/routes/test.routes.js');
const { default: entregaRoutes } = await import('../src/routes/entregaEjercicio.routes.js');
const { default: userRoutes } = await import('../src/routes/user.routes.js');

const UPLOADS = path.resolve('public/ejercicios');

const crearEjercicio = (course) => Ejercicio.create({ cursoId: course._id, titulo: 'Ej 1', contexto: 'c', enunciado: 'e' });
const crearTest = (course) => Test.create({
  cursoId: String(course._id),
  temaId: String(course.temas[0]._id),
  titulo: 'Test tema 1',
  preguntas: [{ numero: 1, pregunta: '¿?', opciones: [{ id: 'a', texto: 'Sí' }, { id: 'b', texto: 'No' }], respuestaCorrecta: 'a' }],
});

describe('rutas de contenido con acceso por cohortes', () => {
  let db;
  let api;
  let privado;
  let publico;
  let ana; // miembro en fechas
  let rita; // miembro de una edición terminada (solo lectura)
  let luis; // registrado, sin cohorte

  before(async () => {
    db = await startMemoryMongo();
    api = fx.listen([
      ['/api/ejercicios', ejercicioRoutes],
      ['/api/tests', testRoutes],
      ['/api/entregas', entregaRoutes],
      ['/api/users', userRoutes],
    ]);
  });
  after(async () => {
    await api.close();
    await db.stop();
  });
  beforeEach(async () => {
    await db.reset();
    privado = await fx.createCourse({ accessMode: 'private' });
    publico = await fx.createCourse({ accessMode: 'public' });
    ana = await fx.createUser();
    rita = await fx.createUser();
    luis = await fx.createUser();
    await fx.createCohort(privado, { members: [ana] });
    await fx.createCohort(privado, { window: 'ended', members: [rita] });
  });

  // Cada ruta de lectura del curso privado: [descripción, método, ruta, body?]
  const lecturas = async () => {
    const ej = await crearEjercicio(privado);
    const tst = await crearTest(privado);
    return [
      ['ejercicios del curso', 'GET', `/api/ejercicios/curso/${privado._id}`],
      ['ejercicio por id', 'GET', `/api/ejercicios/${ej._id}`],
      ['test del tema', 'GET', `/api/tests/${privado._id}/temas/${tst.temaId}/test`],
      ['validar test', 'POST', `/api/tests/${privado._id}/temas/${tst.temaId}/test/validar`, { respuestas: [{ numero: 1, respuesta: 'a' }] }],
      ['mi entrega de un ejercicio', 'GET', `/api/entregas/ejercicio/${ej._id}/usuario`],
      ['mis entregas del curso', 'GET', `/api/entregas/curso/${privado._id}/usuario`],
    ];
  };

  describe('externos', () => {
    test('sin sesión: 401 en todas las rutas de contenido del curso privado', async () => {
      for (const [name, method, url, body] of await lecturas()) {
        const r = await api.call(method, url, { body });
        assert.equal(r.status, 401, name);
        assert.equal(r.text.includes('respuestaCorrecta'), false, name);
      }
    });

    test('con sesión sin cohorte: 403 en todas y nada de contenido', async () => {
      for (const [name, method, url, body] of await lecturas()) {
        const r = await api.call(method, url, { headers: fx.authHeader(luis), body });
        assert.equal(r.status, 403, name);
        assert.equal(r.body.access.reason, 'not-member', name);
        assert.equal(r.text.includes('Ej 1'), false, name);
      }
    });

    test('con sesión sin cohorte: progreso, completar y test completado → 403', async () => {
      const temaId = String(privado.temas[0]._id);
      const rutas = [
        ['PUT', `/api/users/enrollment/${privado._id}/language`, { preferredLanguage: 'es' }],
        ['PUT', `/api/users/enrollment/${privado._id}/progress`, { progress: 10 }],
        ['PUT', `/api/users/enrollment/${privado._id}/complete`],
        ['POST', `/api/users/enrollment/${privado._id}/test/${temaId}/complete`, { score: 100 }],
      ];
      await UserProgress.create({ userId: luis._id, courseId: privado._id }); // inscripción de antes del cambio
      for (const [method, url, body] of rutas) {
        const r = await api.call(method, url, { headers: fx.authHeader(luis), body });
        assert.equal(r.status, 403, url);
      }
    });

    test('entregar en un ejercicio del privado mandando el id de un curso público en el body → 403', async () => {
      const ej = await crearEjercicio(privado);
      const form = new FormData();
      form.append('cursoId', String(publico._id));
      form.append('archivoPdf', new Blob(['%PDF-1.4'], { type: 'application/pdf' }), 'a.pdf');
      const res = await fetch(`${apiBase(api)}/api/entregas/ejercicio/${ej._id}`, { method: 'POST', headers: fx.authHeader(luis), body: form });
      assert.equal(res.status, 403);
      assert.equal(await EntregaEjercicio.countDocuments(), 0);
    });
  });

  describe('miembros', () => {
    test('miembro en fechas: 200 en todas las rutas de lectura', async () => {
      for (const [name, method, url, body] of await lecturas()) {
        const r = await api.call(method, url, { headers: fx.authHeader(ana), body });
        assert.ok([200, 404].includes(r.status) && r.status !== 403, `${name}: ${r.status}`);
      }
    });

    test('miembro en fechas: la entrega se guarda con el curso del ejercicio, no el del body', async () => {
      const ej = await crearEjercicio(privado);
      const form = new FormData();
      form.append('cursoId', String(publico._id));
      form.append('archivoPdf', new Blob(['%PDF-1.4'], { type: 'application/pdf' }), 'a.pdf');
      const res = await fetch(`${apiBase(api)}/api/entregas/ejercicio/${ej._id}`, { method: 'POST', headers: fx.authHeader(ana), body: form });
      const entrega = await EntregaEjercicio.findOne({ userId: ana._id }).lean();
      if (entrega) fs.rmSync(path.join(UPLOADS, path.basename(entrega.archivoPdf.url)), { force: true });
      assert.equal(res.status, 201);
      assert.equal(String(entrega.cursoId), String(privado._id));
    });

    test('solo lectura: puede leer, marcar progreso y hacer tests', async () => {
      for (const [name, method, url, body] of await lecturas()) {
        const r = await api.call(method, url, { headers: fx.authHeader(rita), body });
        assert.notEqual(r.status, 403, name);
        assert.notEqual(r.status, 401, name);
      }
      await UserProgress.create({ userId: rita._id, courseId: privado._id });
      const r = await api.call('PUT', `/api/users/enrollment/${privado._id}/progress`, { headers: fx.authHeader(rita), body: { progress: 10 } });
      assert.equal(r.status, 200);
    });

    test('solo lectura: no puede entregar (403) ni borrar su entrega (403)', async () => {
      const ej = await crearEjercicio(privado);
      const form = new FormData();
      form.append('archivoPdf', new Blob(['%PDF-1.4'], { type: 'application/pdf' }), 'a.pdf');
      const post = await fetch(`${apiBase(api)}/api/entregas/ejercicio/${ej._id}`, { method: 'POST', headers: fx.authHeader(rita), body: form });
      assert.equal(post.status, 403);
      assert.equal((await post.json()).access.level, 'readonly');

      const entrega = await EntregaEjercicio.create({ ejercicioId: ej._id, userId: rita._id, cursoId: privado._id, archivoPdf: { url: '/x.pdf', filePath: '/x.pdf', nombreOriginal: 'x.pdf' } });
      const del = await api.call('DELETE', `/api/entregas/${entrega._id}`, { headers: fx.authHeader(rita) });
      assert.equal(del.status, 403);
      assert.equal(await EntregaEjercicio.countDocuments({ _id: entrega._id }), 1);
    });
  });

  describe('administración de ejercicios y tests (antes sin autenticación)', () => {
    const body = () => ({ cursoId: String(privado._id), titulo: 'Nuevo', contexto: 'c', enunciado: 'e' });

    test('sin token: crear, editar y borrar ejercicios → 401', async () => {
      const ej = await crearEjercicio(privado);
      assert.equal((await api.call('POST', '/api/ejercicios', { body: body() })).status, 401);
      assert.equal((await api.call('PUT', `/api/ejercicios/${ej._id}`, { body: { titulo: 'X' } })).status, 401);
      assert.equal((await api.call('DELETE', `/api/ejercicios/${ej._id}`)).status, 401);
      assert.equal((await Ejercicio.findById(ej._id)).titulo, 'Ej 1');
    });

    test('usuario normal: crear ejercicio → 403', async () => {
      assert.equal((await api.call('POST', '/api/ejercicios', { headers: fx.authHeader(ana), body: body() })).status, 403);
    });

    test('admin: crear ejercicio → 201', async () => {
      const admin = await fx.createUser({ role: 'admin' });
      const r = await api.call('POST', '/api/ejercicios', { headers: fx.authHeader(admin), body: body() });
      assert.equal(r.status, 201);
    });

    test('crear test: sin token 401, usuario normal 403', async () => {
      assert.equal((await api.call('POST', '/api/tests/test', { body: {} })).status, 401);
      assert.equal((await api.call('POST', '/api/tests/test', { headers: fx.authHeader(ana), body: {} })).status, 403);
    });
  });

  describe('cursos públicos: igual que antes', () => {
    test('ejercicios y test del curso público sin sesión → 200', async () => {
      await crearEjercicio(publico);
      const tst = await crearTest(publico);
      assert.equal((await api.call('GET', `/api/ejercicios/curso/${publico._id}`)).status, 200);
      assert.equal((await api.call('GET', `/api/tests/${publico._id}/temas/${tst.temaId}/test`)).status, 200);
    });

    test('progreso en curso público con inscripción → 200', async () => {
      await UserProgress.create({ userId: luis._id, courseId: publico._id });
      const r = await api.call('PUT', `/api/users/enrollment/${publico._id}/progress`, { headers: fx.authHeader(luis), body: { progress: 10 } });
      assert.equal(r.status, 200);
    });

    test('ejercicio inexistente → 404', async () => {
      assert.equal((await api.call('GET', '/api/ejercicios/64b0000000000000000000ff')).status, 404);
    });
  });
});

function apiBase(api) {
  return `http://127.0.0.1:${api.server.address().port}`;
}
