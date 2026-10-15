// API de reseñas con los modelos simulados: no necesita base de datos ni red externa.
// Ejecutar: npm test
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'x'.repeat(40);
process.env.NODE_ENV = 'production';

const { default: express } = await import('express');
const { signToken, verifyToken } = await import('../src/config/jwt.js');
const { default: Review } = await import('../src/models/Review.js');
const { default: User } = await import('../src/models/User.js');
const { default: router } = await import('../src/routes/review.routes.js');

const ANA = '64b000000000000000000001';
const LUIS = '64b000000000000000000002';
const ADMIN = '64b000000000000000000009';
const ID_ANA = '64c000000000000000000001';
const ID_LUIS = '64c000000000000000000002';
const accounts = {
  [ANA]: { _id: ANA, name: 'Ana', email: 'ana@x.com', role: 'usuario' },
  [LUIS]: { _id: LUIS, name: 'Luis', email: 'luis@x.com', role: 'usuario' },
  [ADMIN]: { _id: ADMIN, name: 'Admin', email: 'admin@x.com', role: 'admin' },
};

let db;
const asDoc = (r) =>
  r &&
  Object.assign({ ...r }, {
    async save() { db[this._id] = { ...this }; return this; },
    async deleteOne() { delete db[this._id]; },
    toObject() { const { save, deleteOne, toObject, ...plain } = this; return plain; },
  });

User.findById = (id) => ({ select: () => ({ lean: async () => accounts[id] ?? null }) });
Review.find = () => ({ sort: () => ({ lean: async () => Object.values(db) }) });
Review.exists = async ({ userId }) => Object.values(db).some((r) => String(r.userId) === String(userId));
Review.findById = async (id) => asDoc(db[id]);
Review.prototype.save = async function () { db[this._id] = this.toObject(); return this; };

let server;
let base;
before(() => {
  const app = express();
  app.use(express.json());
  app.use('/api/reviews', router);
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}/api/reviews`;
});
after(() => server.close());
beforeEach(() => {
  db = {
    [ID_LUIS]: { _id: ID_LUIS, user: 'Luis', userId: LUIS, rating: 3, description: 'De Luis', __v: 0 },
  };
});

const call = async (method, path, who, body) => {
  const headers = { 'Content-Type': 'application/json' };
  if (who) headers.Authorization = `Bearer ${signToken({ id: who, email: accounts[who].email })}`;
  const res = await fetch(base + path, { method, headers, body: body && JSON.stringify(body) });
  return { status: res.status, body: await res.json() };
};

test('GET es público, no expone userId y marca las propias con sesión', async () => {
  const anon = await call('GET', '/');
  assert.equal(anon.status, 200);
  assert.equal(anon.body[0].userId, undefined);
  assert.equal(anon.body[0].mine, undefined);
  const luis = await call('GET', '/', LUIS);
  assert.equal(luis.body[0].mine, true);
});

test('POST: el nombre sale de la cuenta, no del cuerpo', async () => {
  const res = await call('POST', '/', ANA, { rating: 4, description: '  Hola  ', name: 'Suplantador' });
  assert.equal(res.status, 201);
  assert.equal(res.body.review.user, 'Ana');
  assert.equal(res.body.review.description, 'Hola');
  assert.equal(res.body.review.mine, true);
});

test('POST: una reseña por cuenta (409 si ya tiene una)', async () => {
  const res = await call('POST', '/', LUIS, { rating: 5, description: 'Otra' });
  assert.equal(res.status, 409);
});

test('POST: validación y sesión obligatoria', async () => {
  const bad = await call('POST', '/', ANA, { rating: 9, description: 'x'.repeat(2001) });
  assert.equal(bad.status, 400);
  assert.deepEqual(bad.body.errors.map((e) => e.path), ['rating', 'description']);
  assert.equal((await call('POST', '/', null, { rating: 4, description: 'x' })).status, 401);
});

test('PUT: solo su autor edita', async () => {
  const mine = await call('PUT', `/${ID_LUIS}`, LUIS, { rating: 1, description: ' Editada ' });
  assert.equal(mine.status, 200);
  assert.equal(db[ID_LUIS].description, 'Editada');
  assert.ok(db[ID_LUIS].updatedAt);
  const other = await call('PUT', `/${ID_LUIS}`, ANA, { rating: 5, description: 'hack' });
  assert.equal(other.status, 403);
  assert.equal(db[ID_LUIS].description, 'Editada');
  assert.equal((await call('PUT', '/no-es-un-id', LUIS, { rating: 3, description: 'x' })).status, 400);
});

test('DELETE: su autor o un admin; nadie más', async () => {
  assert.equal((await call('DELETE', `/${ID_LUIS}`, ANA)).status, 403);
  assert.ok(db[ID_LUIS]);
  assert.equal((await call('DELETE', `/${ID_LUIS}`, ADMIN)).status, 200);
  assert.equal(db[ID_LUIS], undefined);
  assert.equal((await call('DELETE', `/${ID_LUIS}`, LUIS)).status, 404);
});

test('500 sin detalles internos en producción', async () => {
  const original = Review.find;
  Review.find = () => ({ sort: () => ({ lean: async () => { throw new Error('secreto interno'); } }) });
  const res = await call('GET', '/');
  Review.find = original;
  assert.equal(res.status, 500);
  assert.deepEqual(res.body, { error: 'Error en el servidor' });
});

test('JWT: algoritmo fijado y secreto obligatorio', async () => {
  const { default: jwt } = await import('jsonwebtoken');
  assert.throws(() => verifyToken(jwt.sign({ id: 'x' }, process.env.JWT_SECRET, { algorithm: 'HS512' })));
  const none = `${Buffer.from('{"alg":"none"}').toString('base64url')}.${Buffer.from('{"id":"x"}').toString('base64url')}.`;
  assert.throws(() => verifyToken(none));
  const saved = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;
  assert.throws(() => signToken({ id: 'x' }), /JWT_SECRET/);
  process.env.JWT_SECRET = saved;
});
