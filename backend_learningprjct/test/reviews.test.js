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
const DAY = 24 * 60 * 60 * 1000;
let accounts;
let db;
const asDoc = (r) =>
  r &&
  Object.assign({ ...r }, {
    async save() { db[this._id] = { ...this }; return this; },
    async deleteOne() { delete db[this._id]; },
    toObject() { const { save, deleteOne, toObject, ...plain } = this; return plain; },
  });

User.findById = (id) => ({ select: () => ({ lean: async () => (accounts[id] ? { ...accounts[id] } : null) }) });
// Reserva atómica del plazo: solo si no hay lastReviewAt o tiene más de 24 h; devuelve el documento anterior
User.findOneAndUpdate = (filter, update) => ({
  select: () => ({
    lean: async () => {
      const acc = accounts[filter._id];
      const limit = filter.$or[1].lastReviewAt.$lte;
      if (!acc || (acc.lastReviewAt && acc.lastReviewAt > limit)) return null;
      const before = { ...acc };
      acc.lastReviewAt = update.$set.lastReviewAt;
      return before;
    },
  }),
});
User.updateOne = async (filter, update) => {
  accounts[filter._id].lastReviewAt = update.$set.lastReviewAt ?? undefined;
};
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
  accounts = {
    [ANA]: { _id: ANA, name: 'Ana', email: 'ana@x.com', role: 'usuario' },
    [LUIS]: { _id: LUIS, name: 'Luis', email: 'luis@x.com', role: 'usuario', lastReviewAt: new Date(Date.now() - 2 * DAY) },
    [ADMIN]: { _id: ADMIN, name: 'Admin', email: 'admin@x.com', role: 'admin' },
  };
  db = {
    [ID_LUIS]: { _id: ID_LUIS, user: 'Luis', userId: LUIS, rating: 3, description: 'De Luis', __v: 0 },
  };
});

// Cada petición con una IP distinta: así se prueba el límite diario por cuenta, no el de IP
let ip = 0;
const call = async (method, path, who, body) => {
  ip += 1;
  const headers = { 'Content-Type': 'application/json', 'X-Forwarded-For': `10.0.${Math.floor(ip / 250)}.${ip % 250}` };
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

test('POST: una reseña cada 24 h (429 con la hora a la que podrá)', async () => {
  const first = await call('POST', '/', ANA, { rating: 5, description: 'Primera' });
  assert.equal(first.status, 201);
  assert.ok(new Date(first.body.nextReviewAt) > new Date(Date.now() + DAY - 5000));
  const second = await call('POST', '/', ANA, { rating: 4, description: 'Segunda el mismo día' });
  assert.equal(second.status, 429);
  assert.match(second.body.error, /24 horas/);
  assert.ok(new Date(second.body.nextReviewAt) > new Date());
});

test('POST: pasado el plazo puede publicar otra aunque ya tenga reseñas', async () => {
  const res = await call('POST', '/', LUIS, { rating: 5, description: 'Otra, dos días después' });
  assert.equal(res.status, 201);
});

test('POST: borrar la reseña del día no reabre el plazo', async () => {
  const created = await call('POST', '/', ANA, { rating: 5, description: 'La borro enseguida' });
  assert.equal((await call('DELETE', `/${created.body.review._id}`, ANA)).status, 200);
  assert.equal((await call('POST', '/', ANA, { rating: 5, description: 'Otra vez' })).status, 429);
});

test('POST: si no se guarda, el plazo vuelve a como estaba', async () => {
  const original = Review.prototype.save;
  Review.prototype.save = async () => { throw new Error('fallo de BD'); };
  assert.equal((await call('POST', '/', ANA, { rating: 5, description: 'x' })).status, 500);
  Review.prototype.save = original;
  assert.equal(accounts[ANA].lastReviewAt, undefined);
  assert.equal((await call('POST', '/', ANA, { rating: 5, description: 'Ahora sí' })).status, 201);
});

test('GET /status: cuándo puede publicar la siguiente', async () => {
  assert.deepEqual((await call('GET', '/status', ANA)).body, { canPost: true, nextReviewAt: null });
  await call('POST', '/', ANA, { rating: 5, description: 'Hoy' });
  const after = (await call('GET', '/status', ANA)).body;
  assert.equal(after.canPost, false);
  assert.ok(after.nextReviewAt);
  assert.equal((await call('GET', '/status', null)).status, 401);
});

test('POST: validación y sesión obligatoria', async () => {
  const bad = await call('POST', '/', ANA, { rating: 9, description: 'x'.repeat(2001) });
  assert.equal(bad.status, 400);
  assert.deepEqual(bad.body.errors.map((e) => e.path), ['rating', 'description']);
  assert.equal((await call('POST', '/', null, { rating: 4, description: 'x' })).status, 401);
});

test('PUT: editar no consume el plazo diario', async () => {
  await call('POST', '/', ANA, { rating: 5, description: 'Hoy' });
  const stamp = accounts[ANA].lastReviewAt;
  const id = Object.values(db).find((r) => String(r.userId) === ANA)._id;
  assert.equal((await call('PUT', `/${id}`, ANA, { rating: 4, description: 'Editada' })).status, 200);
  assert.equal(accounts[ANA].lastReviewAt, stamp);
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
