// Invitaciones a cohortes: creación (solo hash en BD), canje idempotente y atómico, rate limit.
import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'x'.repeat(40);
process.env.FRONTEND_URL = 'https://campus.test';

const { startMemoryMongo } = await import('./helpers/memoryMongo.js');
const fx = await import('./helpers/cohortFixtures.js');
const { default: Cohort } = await import('../src/models/Cohort.js');
const { default: CohortInvite } = await import('../src/models/CohortInvite.js');
const { createInvite, redeemInvite, previewInvite, hashToken, InviteError } = await import('../src/service/cohortInvites.js');
const { default: cohortRoutes } = await import('../src/routes/cohort.routes.js');

const DAY = fx.DAY;
const later = (days) => new Date(Date.now() + days * DAY);

describe('invitaciones a cohortes', () => {
  let db;
  let api;
  let course;
  let cohort;
  let admin;

  before(async () => {
    db = await startMemoryMongo();
    api = fx.listen([['/api/cohorts', cohortRoutes]]);
  });
  after(async () => {
    await api.close();
    await db.stop();
  });
  beforeEach(async () => {
    await db.reset();
    course = await fx.createCourse({ accessMode: 'private' });
    cohort = await fx.createCohort(course);
    admin = await fx.createUser({ role: 'admin' });
  });

  const invite = (extra = {}) => createInvite({ cohortId: cohort._id, createdBy: admin._id, expiresAt: later(7), ...extra });
  const members = async () => (await Cohort.findById(cohort._id).lean()).members;
  const rejects = (promise, code) => assert.rejects(promise, (err) => err instanceof InviteError && err.code === code);

  describe('createInvite', () => {
    test('devuelve token y URL; en BD solo el hash', async () => {
      const { invite: inv, token, url } = await invite();
      assert.match(token, /^[\w-]{43}$/); // 32 bytes en base64url
      assert.equal(url, `https://campus.test/curso/${course._id}/invitacion?token=${token}`);
      const raw = await CohortInvite.collection.findOne({ _id: inv._id });
      assert.equal(raw.tokenHash, hashToken(token));
      assert.equal(JSON.stringify(raw).includes(token), false);
    });

    test('dos invitaciones nunca comparten token', async () => {
      const a = await invite();
      const b = await invite();
      assert.notEqual(a.token, b.token);
    });

    test('caducidad en el pasado → error', async () => {
      await rejects(invite({ expiresAt: new Date(Date.now() - 1000) }), 'bad-expiry');
    });
  });

  describe('redeemInvite', () => {
    test('válida: entra como miembro activo con source invite y consume un uso', async () => {
      const ana = await fx.createUser();
      const { token, invite: inv } = await invite();
      const r = await redeemInvite({ token, user: ana });
      assert.deepEqual(r, { status: 'joined', courseId: String(course._id) });
      const [m] = await members();
      assert.equal(String(m.user), String(ana._id));
      assert.equal(m.status, 'active');
      assert.equal(m.source, 'invite');
      assert.equal(m.email, ana.email);
      assert.equal((await CohortInvite.findById(inv._id)).uses, 1);
    });

    test('mete al usuario aunque su email no sea el de la invitación', async () => {
      const ana = await fx.createUser({ email: 'otra@x.es' });
      const { token } = await invite({ email: 'invitada@x.es', maxUses: 5 });
      assert.equal((await redeemInvite({ token, user: ana })).status, 'joined');
    });

    test('el mismo usuario otra vez: already-member, sin duplicar ni gastar uso', async () => {
      const ana = await fx.createUser();
      const { token, invite: inv } = await invite({ maxUses: 3 });
      await redeemInvite({ token, user: ana });
      const r = await redeemInvite({ token, user: ana });
      assert.equal(r.status, 'already-member');
      assert.equal((await members()).length, 1);
      assert.equal((await CohortInvite.findById(inv._id)).uses, 1);
    });

    test('ya era miembro pendiente por su email: pasa a activo sin gastar uso', async () => {
      const ana = await fx.createUser({ email: 'ana@x.es' });
      await Cohort.updateOne({ _id: cohort._id }, { $push: { members: { email: 'ana@x.es', status: 'pending', user: null, source: 'email' } } });
      const { token, invite: inv } = await invite();
      const r = await redeemInvite({ token, user: ana });
      assert.equal(r.status, 'joined');
      const ms = await members();
      assert.equal(ms.length, 1);
      assert.equal(ms[0].status, 'active');
      assert.equal(String(ms[0].user), String(ana._id));
      assert.equal((await CohortInvite.findById(inv._id)).uses, 0);
    });

    test('invitación a un email pendiente canjeada por otra cuenta: ocupa esa plaza, no crea otra', async () => {
      const otra = await fx.createUser({ email: 'personal@x.es' });
      await Cohort.updateOne({ _id: cohort._id }, { $push: { members: { email: 'trabajo@x.es', status: 'pending', user: null, source: 'email' } } });
      const { token } = await invite({ email: 'trabajo@x.es' });
      await redeemInvite({ token, user: otra });
      const ms = await members();
      assert.equal(ms.length, 1);
      assert.equal(String(ms[0].user), String(otra._id));
      assert.equal(ms[0].status, 'active');
    });

    test('caducada → expired', async () => {
      const { token, invite: inv } = await invite();
      await CohortInvite.updateOne({ _id: inv._id }, { expiresAt: new Date(Date.now() - 1000) });
      await rejects(redeemInvite({ token, user: await fx.createUser() }), 'expired');
    });

    test('revocada → revoked', async () => {
      const { token, invite: inv } = await invite();
      await CohortInvite.updateOne({ _id: inv._id }, { revokedAt: new Date() });
      await rejects(redeemInvite({ token, user: await fx.createUser() }), 'revoked');
    });

    test('agotada (maxUses 1 ya usada por otro) → exhausted', async () => {
      const { token } = await invite();
      await redeemInvite({ token, user: await fx.createUser() });
      await rejects(redeemInvite({ token, user: await fx.createUser() }), 'exhausted');
    });

    test('dos canjes simultáneos del último uso: uno entra y el otro exhausted', async () => {
      const { token, invite: inv } = await invite();
      const [a, b] = [await fx.createUser(), await fx.createUser()];
      const results = await Promise.allSettled([redeemInvite({ token, user: a }), redeemInvite({ token, user: b })]);
      const ok = results.filter((r) => r.status === 'fulfilled');
      const ko = results.filter((r) => r.status === 'rejected');
      assert.equal(ok.length, 1);
      assert.equal(ko.length, 1);
      assert.equal(ko[0].reason.code, 'exhausted');
      assert.equal((await members()).length, 1);
      assert.equal((await CohortInvite.findById(inv._id)).uses, 1);
    });

    test('el mismo usuario canjeando dos veces a la vez: un solo miembro y un solo uso', async () => {
      const { token, invite: inv } = await invite({ maxUses: 5 });
      const ana = await fx.createUser();
      await Promise.all([redeemInvite({ token, user: ana }), redeemInvite({ token, user: ana })]);
      assert.equal((await members()).length, 1);
      assert.equal((await CohortInvite.findById(inv._id)).uses, 1);
    });

    test('token alterado, vacío o no texto → invalid', async () => {
      const { token } = await invite();
      const ana = await fx.createUser();
      await rejects(redeemInvite({ token: `${token.slice(0, -1)}x`, user: ana }), 'invalid');
      await rejects(redeemInvite({ token: '', user: ana }), 'invalid');
      await rejects(redeemInvite({ token: { $ne: null }, user: ana }), 'invalid');
    });
  });

  describe('previewInvite', () => {
    test('válida: curso y estado sin datos sensibles', async () => {
      const { token } = await invite();
      const p = await previewInvite(token);
      assert.deepEqual(p, { valid: true, courseId: String(course._id), courseTitle: 'Curso', cohortName: 'Cohorte' });
    });
    test('caducada: valid false con code y curso', async () => {
      const { token, invite: inv } = await invite();
      await CohortInvite.updateOne({ _id: inv._id }, { expiresAt: new Date(Date.now() - 1000) });
      const p = await previewInvite(token);
      assert.equal(p.valid, false);
      assert.equal(p.code, 'expired');
      assert.equal(p.courseId, String(course._id));
    });
    test('inexistente: valid false, invalid y sin curso', async () => {
      assert.deepEqual(await previewInvite('nada'), { valid: false, code: 'invalid' });
    });
  });

  describe('rutas', () => {
    test('POST /invitations/redeem sin sesión → 401', async () => {
      const { token } = await invite();
      const r = await api.call('POST', '/api/cohorts/invitations/redeem', { body: { token } });
      assert.equal(r.status, 401);
    });

    test('POST /invitations/redeem válida → 200 con courseId', async () => {
      const ana = await fx.createUser();
      const { token } = await invite();
      const r = await api.call('POST', '/api/cohorts/invitations/redeem', { headers: fx.authHeader(ana), body: { token } });
      assert.equal(r.status, 200);
      assert.deepEqual(r.body, { status: 'joined', courseId: String(course._id) });
    });

    test('caducada → 410 con code y mensaje', async () => {
      const ana = await fx.createUser();
      const { token, invite: inv } = await invite();
      await CohortInvite.updateOne({ _id: inv._id }, { expiresAt: new Date(Date.now() - 1000) });
      const r = await api.call('POST', '/api/cohorts/invitations/redeem', { headers: fx.authHeader(ana), body: { token } });
      assert.equal(r.status, 410);
      assert.equal(r.body.code, 'expired');
      assert.ok(r.body.error);
    });

    test('inválida → 404', async () => {
      const ana = await fx.createUser();
      const r = await api.call('POST', '/api/cohorts/invitations/redeem', { headers: fx.authHeader(ana), body: { token: 'no-existe' } });
      assert.equal(r.status, 404);
      assert.equal(r.body.code, 'invalid');
    });

    test('GET /invitations/preview sin sesión → 200', async () => {
      const { token } = await invite();
      const r = await api.call('GET', `/api/cohorts/invitations/preview?token=${encodeURIComponent(token)}`);
      assert.equal(r.status, 200);
      assert.equal(r.body.valid, true);
    });

    test('canje con rate limit: el intento 11 en la ventana → 429', async () => {
      const ana = await fx.createUser();
      let last;
      for (let i = 0; i < 11; i += 1) {
        last = await api.call('POST', '/api/cohorts/invitations/redeem', { headers: fx.authHeader(ana), body: { token: `malo-${i}` } });
      }
      assert.equal(last.status, 429);
    });
  });
});
