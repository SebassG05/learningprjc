// Inscripciones del panel (pestaña Reservas): validación, permisos y la agregación real.
// La agregación necesita un MongoDB desechable (MONGO_TEST_URI) y se salta sin él.
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'x'.repeat(40);
process.env.NODE_ENV = 'production';

const { default: mongoose } = await import('mongoose');
const { default: express } = await import('express');
const { signToken } = await import('../src/config/jwt.js');
const { default: User } = await import('../src/models/User.js');
const { default: Course } = await import('../src/models/Course.js');
const { default: UserProgress } = await import('../src/models/UserProgress.js');
const { buildInscripcionesPipeline, formatInscripciones, parseInscripciones } = await import('../src/service/inscripcionesQueryService.js');
const { default: userRoutes } = await import('../src/routes/user.routes.js');

const id = (n) => new mongoose.Types.ObjectId(n.toString(16).padStart(24, '0'));

describe('parseInscripciones', () => {
  test('por defecto: más recientes, 20 por página', () => {
    const f = parseInscripciones({});
    assert.equal(f.orden, 'recientes');
    assert.equal(f.limit, 20);
  });
  test('rechaza estado, curso u orden inválidos', () => {
    for (const q of [{ estado: 'cancelada' }, { curso: 'x' }, { orden: 'azar' }, { hasta: 'mañana' }]) {
      assert.throws(() => parseInscripciones(q), (e) => e.status === 400, JSON.stringify(q));
    }
  });
  test('un mes de calendario cabe en una página (máx. 500)', () => {
    assert.equal(parseInscripciones({ limit: '9999' }).limit, 500);
  });
});

describe('GET /users/admin/enrollments (permisos)', () => {
  let server;
  let base;
  const ADMIN = '64b000000000000000000009';
  const ANA = '64b000000000000000000001';
  const saved = {};
  before(() => {
    saved.findById = User.findById;
    saved.aggregate = UserProgress.aggregate;
    User.findById = (uid) => ({
      select: async () => ({ _id: uid, role: uid === ADMIN ? 'admin' : 'usuario', activo: true, esAdmin() { return this.role === 'admin'; }, async save() {} }),
    });
    UserProgress.aggregate = async () => [{ stats: [{ _id: 'enrolled', n: 2 }], total: [{ n: 2 }], inscripciones: [{ _id: 'p1' }, { _id: 'p2' }] }];
    const app = express();
    app.use('/api/users', userRoutes);
    server = app.listen(0);
    base = `http://127.0.0.1:${server.address().port}/api/users/admin/enrollments`;
  });
  after(() => {
    server.close();
    User.findById = saved.findById;
    UserProgress.aggregate = saved.aggregate;
  });
  const get = async (who, qs = '') => {
    const headers = who ? { Authorization: `Bearer ${signToken({ id: who, email: 'x@x.com' })}` } : {};
    const res = await fetch(base + qs, { headers });
    return { status: res.status, body: await res.json() };
  };

  test('sin sesión → 401; alumno → 403', async () => {
    assert.equal((await get(null)).status, 401);
    assert.equal((await get(ANA)).status, 403);
  });
  test('admin → lista paginada con stats', async () => {
    const r = await get(ADMIN, '?estado=enrolled');
    assert.equal(r.status, 200);
    assert.equal(r.body.total, 2);
    assert.deepEqual(r.body.stats, { enrolled: 2, completed: 0, total: 2 });
  });
  test('parámetro inválido → 400', async () => {
    assert.equal((await get(ADMIN, '?estado=x')).status, 400);
  });
});

const URI = process.env.MONGO_TEST_URI;
describe('agregación real de inscripciones (MongoDB desechable)', { skip: !URI && 'sin MONGO_TEST_URI' }, () => {
  const now = Date.parse('2026-10-19T12:00:00Z');
  const DAY = 864e5;
  const C1 = id(0xc1);
  const C2 = id(0xc2);
  const run = async (query) => {
    const f = parseInscripciones(query);
    return formatInscripciones(await UserProgress.aggregate(buildInscripcionesPipeline(f, { users: User.collection.name, courses: Course.collection.name })), f);
  };

  before(async () => {
    await mongoose.connect(URI, { dbName: 'test_inscripciones' }); // una base por archivo: node --test los ejecuta en paralelo
    await mongoose.connection.db.dropDatabase();
    const db = mongoose.connection.db;
    await db.collection(User.collection.name).insertMany([
      { _id: id(1), name: 'Lucía Romero', email: 'lucia@x.es' },
      { _id: id(2), name: 'Pablo Ortega', email: 'pablo@x.es' },
    ]);
    await db.collection(Course.collection.name).insertMany([{ _id: C1, title: 'ANFORA' }, { _id: C2, title: 'Carbono' }]);
    const p = (n, user, course, status, diasAtras, progress) => ({
      _id: id(0x200 + n), userId: user, courseId: course, status, progress, enrolledAt: new Date(now - diasAtras * DAY),
      completedTests: ['t1'], completedMaterials: ['m1'],
    });
    await db.collection(UserProgress.collection.name).insertMany([
      p(1, id(1), C1, 'enrolled', 1, 20),
      p(2, id(2), C1, 'completed', 10, 100),
      p(3, id(1), C2, 'enrolled', 40, 60),
      p(4, id(99), C2, 'enrolled', 3, 0), // alumno eliminado
      p(5, id(2), id(0xdead), 'enrolled', 5, 10), // curso eliminado
    ]);
  });
  after(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  });

  test('más recientes primero; alumno y curso como objetos o null; sin arrays internos', async () => {
    const r = await run({});
    assert.deepEqual(r.inscripciones.map((x) => x._id.toString().slice(-3)), ['201', '204', '205', '202', '203']);
    assert.equal(r.inscripciones[0].userId.name, 'Lucía Romero');
    assert.equal(r.inscripciones[0].courseId.title, 'ANFORA');
    assert.equal(r.inscripciones[1].userId, null);
    assert.equal(r.inscripciones[2].courseId, null);
    assert.equal(r.inscripciones[0].completedTests, undefined);
  });

  test('stats ignoran el estado; total y lista lo aplican', async () => {
    const r = await run({ estado: 'completed' });
    assert.equal(r.total, 1);
    assert.deepEqual(r.stats, { enrolled: 4, completed: 1, total: 5 });
  });

  test('búsqueda por alumno o curso, filtro de curso y rango de fechas (calendario)', async () => {
    assert.equal((await run({ q: 'pablo' })).total, 2);
    assert.equal((await run({ q: 'carbono' })).total, 2);
    assert.equal((await run({ curso: C1.toString() })).total, 2);
    const mes = await run({ desde: new Date(now - 7 * DAY).toISOString(), hasta: new Date(now).toISOString(), orden: 'antiguas', limit: '500' });
    assert.deepEqual(mes.inscripciones.map((x) => x._id.toString().slice(-3)), ['205', '204', '201']);
  });

  test('orden por progreso', async () => {
    assert.deepEqual((await run({ orden: 'progreso' })).inscripciones.map((x) => x.progress), [100, 60, 20, 10, 0]);
  });
});
