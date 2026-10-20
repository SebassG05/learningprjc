// Temas de un curso: reordenar, numeración continua, alta sin choques y edición en los dos idiomas.
// Documentos de Mongoose reales con save() simulado: sin base de datos. Ejecutar: npm test
import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'x'.repeat(40);
process.env.NODE_ENV = 'production';

const { default: express } = await import('express');
const { signToken } = await import('../src/config/jwt.js');
const { default: User } = await import('../src/models/User.js');
const { default: Course } = await import('../src/models/Course.js');
const { editarTema, reordenar, renumerar, siguienteNumero } = await import('../src/service/temasService.js');
const { default: router } = await import('../src/routes/course.routes.js');

const ADMIN = '64b000000000000000000009';
const ANA = '64b000000000000000000001';
const CURSO = '64d000000000000000000001';
const T = ['64e000000000000000000001', '64e000000000000000000002', '64e000000000000000000003'];

let course;
const fresh = () =>
  new Course({
    _id: CURSO,
    title: 'Carbono',
    description: 'x',
    temas: [
      { _id: T[0], numeroTema: 1, orden: 1, titulo: 'Uno' },
      { _id: T[1], numeroTema: 2, orden: 2, titulo: 'Dos', tituloEn: 'Two' },
      { _id: T[2], numeroTema: 3, orden: 3, titulo: 'Tres' },
    ],
  });

describe('temasService', () => {
  test('siguiente número libre (no «cantidad + 1»)', () => {
    assert.equal(siguienteNumero([{ numeroTema: 1 }, { numeroTema: 3 }]), 4);
    assert.equal(siguienteNumero([]), 1);
  });

  test('reordenar exige una permutación exacta y renumera 1..N', () => {
    const c = fresh();
    const r = reordenar(c.temas, [T[2], T[0], T[1]]);
    assert.deepEqual(r.map((t) => [t.titulo, t.numeroTema, t.orden]), [['Tres', 1, 1], ['Uno', 2, 2], ['Dos', 3, 3]]);
    assert.throws(() => reordenar(c.temas, [T[0], T[1]]), /no coincide/);
    assert.throws(() => reordenar(c.temas, [T[0], T[0], T[1]]), /no coincide/);
    assert.throws(() => reordenar(c.temas, [T[0], T[1], '64e0000000000000000000ff']), /no coincide/);
    assert.throws(() => reordenar(c.temas, 'x'), /no coincide/);
  });

  test('renumerar deja la numeración continua', () => {
    const ts = [{ numeroTema: 1 }, { numeroTema: 3 }];
    assert.deepEqual(renumerar(ts).map((t) => t.numeroTema), [1, 2]);
  });

  test('editar: vacío borra, ausente no toca, siempre queda un título', () => {
    const t = fresh().temas[1];
    editarTema(t, { titulo: '  Dos bis ', descripcionEn: 'Desc' });
    assert.equal(t.titulo, 'Dos bis');
    assert.equal(t.tituloEn, 'Two');
    editarTema(t, { tituloEn: '' });
    assert.equal(t.tituloEn, undefined);
    assert.throws(() => editarTema(t, { titulo: ' ' }), /necesita un título/);
    assert.throws(() => editarTema(t, { titulo: 3 }), /debe ser texto/);
  });
});

describe('rutas de temas', () => {
  let server;
  let base;
  const saved = {};
  before(() => {
    saved.findById = Course.findById;
    saved.userFind = User.findById;
    saved.save = Course.prototype.save;
    User.findById = (uid) => ({
      select: async () => ({ _id: uid, role: uid === ADMIN ? 'admin' : 'usuario', activo: true, esAdmin() { return this.role === 'admin'; }, async save() {} }),
    });
    Course.findById = async (cid) => (String(cid) === CURSO ? course : null);
    Course.prototype.save = async function () { return this; };
    const app = express();
    app.use(express.json());
    app.use('/api/courses', router);
    server = app.listen(0);
    base = `http://127.0.0.1:${server.address().port}/api/courses/${CURSO}/temas`;
  });
  after(() => {
    server.close();
    Course.findById = saved.findById;
    User.findById = saved.userFind;
    Course.prototype.save = saved.save;
  });
  beforeEach(() => {
    course = fresh();
  });
  const call = async (method, path, body, who = ADMIN) => {
    const res = await fetch(base + path, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${signToken({ id: who, email: 'x@x.com' })}` },
      body: body && JSON.stringify(body),
    });
    return { status: res.status, body: await res.json().catch(() => ({})) };
  };
  const nums = (b) => b.temas.map((t) => [t.titulo ?? t.tituloEn, t.numeroTema]);

  test('PUT /orden reordena y renumera; solo admin; lista incorrecta → 400', async () => {
    const r = await call('PUT', '/orden', { temaIds: [T[1], T[2], T[0]] });
    assert.equal(r.status, 200);
    assert.deepEqual(nums(r.body), [['Dos', 1], ['Tres', 2], ['Uno', 3]]);
    assert.equal((await call('PUT', '/orden', { temaIds: [T[0]] })).status, 400);
    assert.equal((await call('PUT', '/orden', { temaIds: T }, ANA)).status, 403);
  });

  test('borrar un tema renumera y el siguiente alta no choca', async () => {
    const del = await call('DELETE', `/${T[1]}`);
    assert.equal(del.status, 200);
    assert.deepEqual(nums(del.body), [['Uno', 1], ['Tres', 2]]);
    const add = await call('POST', '', { titulo: 'Nuevo' });
    assert.equal(add.status, 200);
    assert.deepEqual(nums(add.body).at(-1), ['Nuevo', 3]);
  });

  test('alta sin título → 400', async () => {
    assert.equal((await call('POST', '', { descripcion: 'sin título' })).status, 400);
  });

  test('PUT /:temaId edita también los campos en inglés', async () => {
    const r = await call('PUT', `/${T[0]}`, { tituloEn: 'One', descripcionEn: 'First' });
    assert.equal(r.status, 200);
    const t = r.body.temas.find((x) => x._id === T[0]);
    assert.equal(t.tituloEn, 'One');
    assert.equal(t.descripcionEn, 'First');
    assert.equal((await call('PUT', `/${T[0]}`, { titulo: '', tituloEn: '' })).status, 400);
  });
});
