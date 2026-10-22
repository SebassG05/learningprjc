// «Avísame de la próxima edición» en cursos privados.
import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'x'.repeat(40);

const { startMemoryMongo } = await import('./helpers/memoryMongo.js');
const fx = await import('./helpers/cohortFixtures.js');
const { default: CourseInterest } = await import('../src/models/CourseInterest.js');
const { default: courseRoutes } = await import('../src/routes/course.routes.js');

describe('interesados en la próxima edición', () => {
  let db;
  let api;
  let privado;

  before(async () => {
    db = await startMemoryMongo();
    api = fx.listen([['/api/courses', courseRoutes]]);
  });
  after(async () => {
    await api.close();
    await db.stop();
  });
  beforeEach(async () => {
    await db.reset();
    privado = await fx.createCourse({ accessMode: 'private' });
  });

  const apuntar = (course, body, headers = {}) =>
    api.call('POST', `/api/courses/${course._id}/interes`, { body, headers: { 'X-Forwarded-For': `10.0.0.${Math.floor(Math.random() * 250)}`, ...headers } });

  test('anónimo con email válido → 201 y queda guardado normalizado', async () => {
    const r = await apuntar(privado, { email: ' Ana@X.es ' });
    assert.equal(r.status, 201);
    const rows = await CourseInterest.find().lean();
    assert.equal(rows.length, 1);
    assert.equal(rows[0].email, 'ana@x.es');
  });

  test('repetido → 201 sin duplicar', async () => {
    await apuntar(privado, { email: 'ana@x.es' });
    const r = await apuntar(privado, { email: 'ANA@x.es' });
    assert.equal(r.status, 201);
    assert.equal(await CourseInterest.countDocuments(), 1);
  });

  test('con sesión usa el email de la cuenta (ignora el del body)', async () => {
    const ana = await fx.createUser({ email: 'cuenta@x.es' });
    const r = await apuntar(privado, { email: 'otro@x.es' }, fx.authHeader(ana));
    assert.equal(r.status, 201);
    const [row] = await CourseInterest.find().lean();
    assert.equal(row.email, 'cuenta@x.es');
    assert.equal(String(row.user), String(ana._id));
  });

  test('email inválido o ausente sin sesión → 400', async () => {
    assert.equal((await apuntar(privado, { email: 'mal' })).status, 400);
    assert.equal((await apuntar(privado, {})).status, 400);
  });

  test('curso público → 404', async () => {
    const publico = await fx.createCourse({ accessMode: 'public' });
    assert.equal((await apuntar(publico, { email: 'ana@x.es' })).status, 404);
  });

  test('admin: lista de interesados; usuario normal 403', async () => {
    await apuntar(privado, { email: 'ana@x.es' });
    const admin = await fx.createUser({ role: 'admin' });
    const r = await api.call('GET', `/api/courses/${privado._id}/interes`, { headers: fx.authHeader(admin) });
    assert.equal(r.status, 200);
    assert.deepEqual(r.body.map((i) => i.email), ['ana@x.es']);
    const alumno = await fx.createUser();
    assert.equal((await api.call('GET', `/api/courses/${privado._id}/interes`, { headers: fx.authHeader(alumno) })).status, 403);
  });

  test('rate limit: más de 5 por hora desde la misma IP → 429', async () => {
    let last;
    for (let i = 0; i < 6; i += 1) {
      last = await apuntar(privado, { email: `p${i}@x.es` }, { 'X-Forwarded-For': '10.9.9.9' });
    }
    assert.equal(last.status, 429);
  });
});
