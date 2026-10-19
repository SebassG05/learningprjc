// Progreso del curso: resumen de entregas por alumno junto a las inscripciones.
// La agregación real necesita un MongoDB desechable (MONGO_TEST_URI) y se salta sin él.
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'x'.repeat(40);
process.env.NODE_ENV = 'production';

const { default: mongoose } = await import('mongoose');
const { default: express } = await import('express');
const { signToken } = await import('../src/config/jwt.js');
const { default: User } = await import('../src/models/User.js');
const { default: UserProgress } = await import('../src/models/UserProgress.js');
const { default: EntregaEjercicio } = await import('../src/models/EntregaEjercicio.js');
const { default: Ejercicio } = await import('../src/models/Ejercicio.js');
const { buildResumenPipeline, indexarResumen, resumenCurso } = await import('../src/service/progresoService.js');
const { default: userRoutes } = await import('../src/routes/user.routes.js');

const id = (n) => new mongoose.Types.ObjectId(n.toString(16).padStart(24, '0'));
const ADMIN = '64b000000000000000000009';
const CURSO = id(0xc1);

describe('indexarResumen', () => {
  test('media redondeada; sin nota → null; filas sin alumno se ignoran', () => {
    const m = indexarResumen([
      { _id: id(1), total: 3, pendientes: 1, aprobadas: 2, media: 7.3333333, ultima: new Date(0) },
      { _id: id(2), total: 1, pendientes: 1, aprobadas: 0, media: null },
      { _id: null, total: 9 },
    ]);
    assert.equal(m.size, 2);
    assert.equal(m.get(String(id(1))).media, 7.33);
    assert.equal(m.get(String(id(2))).media, null);
  });
});

describe('GET /users/admin/courses/:id/enrollments (modelos simulados)', () => {
  let server;
  let base;
  const saved = {};
  before(() => {
    saved.find = UserProgress.find;
    saved.findById = User.findById;
    saved.aggregate = EntregaEjercicio.aggregate;
    saved.count = Ejercicio.countDocuments;
    User.findById = () => ({ select: async () => ({ _id: ADMIN, role: 'admin', activo: true, esAdmin: () => true, async save() {} }) });
    const rows = [
      { userId: { _id: id(1), name: 'Lucía', email: 'l@x.es' }, enrolledAt: new Date(), progress: 50, status: 'enrolled', completedTests: ['t1'], completedMaterials: [] },
      { userId: { _id: id(2), name: 'Pablo', email: 'p@x.es' }, enrolledAt: new Date(), progress: 10, status: 'enrolled' },
      { userId: null, enrolledAt: new Date(), progress: 0, status: 'enrolled' },
    ];
    const q = { populate: () => q, sort: async () => rows };
    UserProgress.find = () => q;
    EntregaEjercicio.aggregate = async () => [{ _id: id(1), total: 2, pendientes: 1, aprobadas: 1, media: 8 }];
    Ejercicio.countDocuments = async () => 4;
    const app = express();
    app.use('/api/users', userRoutes);
    server = app.listen(0);
    base = `http://127.0.0.1:${server.address().port}/api/users/admin/courses`;
  });
  after(() => {
    server.close();
    UserProgress.find = saved.find;
    User.findById = saved.findById;
    EntregaEjercicio.aggregate = saved.aggregate;
    Ejercicio.countDocuments = saved.count;
  });
  const get = async (path) => {
    const res = await fetch(base + path, { headers: { Authorization: `Bearer ${signToken({ id: ADMIN, email: 'a@x.com' })}` } });
    return { status: res.status, body: await res.json() };
  };

  test('conserva los campos de siempre y añade entregas por alumno y ejercicios del curso', async () => {
    const r = await get(`/${CURSO}/enrollments`);
    assert.equal(r.status, 200);
    assert.equal(r.body.total, 3);
    assert.equal(r.body.curso.ejercicios, 4);
    const [lucia, pablo, borrado] = r.body.enrollments;
    assert.deepEqual(Object.keys(lucia).slice(0, 8), ['userId', 'name', 'email', 'enrolledAt', 'progress', 'status', 'completedTests', 'completedMaterialsCount']);
    assert.equal(lucia.entregas.total, 2);
    assert.equal(lucia.entregas.media, 8);
    assert.deepEqual(pablo.entregas, { total: 0, pendientes: 0, aprobadas: 0, media: null, ultima: null });
    assert.equal(borrado.name, 'N/A');
    assert.equal(borrado.entregas.total, 0);
  });

  test('curso no válido → 400', async () => {
    assert.equal((await get('/no-es-un-id/enrollments')).status, 400);
  });
});

const URI = process.env.MONGO_TEST_URI;
describe('agregación real del resumen (MongoDB desechable)', { skip: !URI && 'sin MONGO_TEST_URI' }, () => {
  before(async () => {
    await mongoose.connect(URI, { dbName: 'test_progreso' }); // una base por archivo: node --test los ejecuta en paralelo
    await mongoose.connection.db.dropDatabase();
    const db = mongoose.connection.db;
    const e = (n, user, curso, estado, calificacion) => ({
      _id: id(0x300 + n), userId: user, cursoId: curso, ejercicioId: id(0xe0 + n), estado,
      fechaEntrega: new Date(Date.UTC(2026, 9, n)), ...(calificacion !== undefined ? { calificacion } : {}),
    });
    await db.collection(EntregaEjercicio.collection.name).insertMany([
      e(1, id(1), CURSO, 'aprobado', 8),
      e(2, id(1), CURSO, 'rechazado', 4),
      e(3, id(1), CURSO, 'enviado'),
      e(4, id(2), CURSO, 'enviado'),
      e(5, id(1), id(0xc2), 'aprobado', 10), // otro curso: no cuenta
    ]);
    await db.collection(Ejercicio.collection.name).insertMany([
      { cursoId: CURSO, titulo: 'a', contexto: 'x', enunciado: 'x', activo: true },
      { cursoId: CURSO, titulo: 'b', contexto: 'x', enunciado: 'x' },
      { cursoId: CURSO, titulo: 'c', contexto: 'x', enunciado: 'x', activo: false },
      { cursoId: id(0xc2), titulo: 'd', contexto: 'x', enunciado: 'x', activo: true },
    ]);
  });
  after(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  });

  test('por alumno: total, pendientes, aprobadas, media (sin contar las no calificadas) y última', async () => {
    const r = await resumenCurso(CURSO.toString());
    const lucia = r.porAlumno.get(String(id(1)));
    assert.deepEqual({ ...lucia, ultima: lucia.ultima.toISOString() }, { total: 3, pendientes: 1, aprobadas: 1, media: 6, ultima: '2026-10-03T00:00:00.000Z' });
    assert.equal(r.porAlumno.get(String(id(2))).media, null);
    assert.equal(r.ejercicios, 2); // los inactivos no cuentan
  });

  test('el pipeline solo mira el curso pedido', () => {
    assert.deepEqual(buildResumenPipeline(CURSO.toString())[0].$match.cursoId, CURSO);
  });
});
