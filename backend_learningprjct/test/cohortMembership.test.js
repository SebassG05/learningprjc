// Plazas pendientes por email: Google (email verificado) las activa al entrar; con contraseña se envía
// un enlace de confirmación a ese email y la plaza se activa al canjearlo.
import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'x'.repeat(40);
process.env.FRONTEND_URL = 'https://campus.test';
process.env.GOOGLE_CLIENT_ID = 'google-client-test';

// El transporte de correo se crea al importar mailService: se sustituye antes
const sent = [];
let mailFails = false;
const { default: nodemailer } = await import('nodemailer');
nodemailer.createTransport = () => ({
  sendMail: async (opts) => {
    if (mailFails) throw new Error('SMTP caído');
    sent.push(opts);
  },
});

// Google: se sustituye la verificación del id_token (no sale a la red)
const { OAuth2Client } = await import('google-auth-library');
let googlePayload;
OAuth2Client.prototype.verifyIdToken = async () => ({ getPayload: () => googlePayload });

const { startMemoryMongo } = await import('./helpers/memoryMongo.js');
const fx = await import('./helpers/cohortFixtures.js');
const { default: Cohort } = await import('../src/models/Cohort.js');
const { default: CohortInvite } = await import('../src/models/CohortInvite.js');
const { default: User } = await import('../src/models/User.js');
const { claimPendingMemberships } = await import('../src/service/cohortMembership.js');
const { redeemInvite } = await import('../src/service/cohortInvites.js');
const { resolveAccess } = await import('../src/service/courseAccess.js');
const { default: userRoutes } = await import('../src/routes/user.routes.js');

describe('plazas pendientes por email', () => {
  let db;
  let api;
  let course;
  let cohort;

  before(async () => {
    db = await startMemoryMongo();
    api = fx.listen([['/api/users', userRoutes]]);
  });
  after(async () => {
    await api.close();
    await db.stop();
  });
  beforeEach(async () => {
    await db.reset();
    sent.length = 0;
    mailFails = false;
    course = await fx.createCourse({ accessMode: 'private', title: 'Modelización Dinámica de Carbono' });
    cohort = await fx.createCohort(course, { name: 'Carbono – Noviembre 2026', members: [{ email: 'ana@x.es', status: 'pending', user: null }] });
  });

  const seat = async () => (await Cohort.findById(cohort._id).lean()).members[0];
  const tokenFromMail = (mail) => decodeURIComponent(/token=([^"&\s]+)/.exec(mail.html)[1]);
  const register = (email) => api.call('POST', '/api/users/register', { body: { name: 'Ana', email, password: 'secreta1', confirmPassword: 'secreta1' } });

  describe('claimPendingMemberships', () => {
    test('verificado: activa la plaza y queda con acceso completo', async () => {
      const ana = await fx.createUser({ email: 'ana@x.es' });
      const r = await claimPendingMemberships(ana, { verified: true });
      assert.deepEqual(r, { activated: 1, emailed: 0 });
      const m = await seat();
      assert.equal(m.status, 'active');
      assert.equal(String(m.user), String(ana._id));
      const fresh = await Cohort.findById(cohort._id).lean();
      assert.equal(resolveAccess({ user: { id: String(ana._id), role: 'usuario' }, course, cohorts: [fresh] }).level, 'full');
    });

    test('no verificado: no activa; envía un enlace de un solo uso a ese email', async () => {
      const ana = await fx.createUser({ email: 'ana@x.es' });
      const r = await claimPendingMemberships(ana, { verified: false });
      assert.deepEqual(r, { activated: 0, emailed: 1 });
      assert.equal((await seat()).status, 'pending');
      assert.equal(sent.length, 1);
      assert.equal(sent[0].to, 'ana@x.es');
      assert.match(sent[0].html, /Modelización Dinámica de Carbono/);
      const inv = await CohortInvite.findOne().lean();
      assert.equal(inv.email, 'ana@x.es');
      assert.equal(inv.maxUses, 1);
      assert.equal(inv.createdBy, null);
    });

    test('no reenvía el enlace si ya se mandó en las últimas 24 h', async () => {
      const ana = await fx.createUser({ email: 'ana@x.es' });
      await claimPendingMemberships(ana, { verified: false });
      const again = await claimPendingMemberships(ana, { verified: false });
      assert.equal(again.emailed, 0);
      assert.equal(sent.length, 1);
    });

    test('compara el email normalizado', async () => {
      const ana = await fx.createUser({ email: 'ana@x.es' });
      const r = await claimPendingMemberships({ _id: ana._id, email: '  ANA@x.es ' }, { verified: true });
      assert.equal(r.activated, 1);
    });

    test('no toca plazas ya vinculadas a otro usuario', async () => {
      const otro = await fx.createUser();
      await Cohort.updateOne({ _id: cohort._id }, { $set: { 'members.0.user': otro._id, 'members.0.status': 'active' } });
      const ana = await fx.createUser({ email: 'ana@x.es' });
      const r = await claimPendingMemberships(ana, { verified: true });
      assert.equal(r.activated, 0);
      assert.equal(String((await seat()).user), String(otro._id));
    });
  });

  describe('flujos', () => {
    test('pendiente → se registra con ese email → enlace → canjea → activo con acceso', async () => {
      const r = await register('Ana@X.es');
      assert.equal(r.status, 201);
      assert.equal(sent.length, 1);
      const ana = await User.findOne({ email: 'ana@x.es' });
      assert.equal((await seat()).status, 'pending'); // registrarse no basta: hay que demostrar el email
      const redeemed = await redeemInvite({ token: tokenFromMail(sent[0]), user: ana });
      assert.equal(redeemed.status, 'joined');
      const m = await seat();
      assert.equal(m.status, 'active');
      assert.equal(String(m.user), String(ana._id));
    });

    test('quien se registra puede iniciar sesión después (contraseña hasheada una sola vez)', async () => {
      await register('luis@x.es');
      const r = await api.call('POST', '/api/users/login', { body: { email: 'luis@x.es', password: 'secreta1' } });
      assert.equal(r.status, 200);
      assert.ok(r.body.token);
    });

    test('el registro devuelve un token válido (el modal entra directamente tras registrarse)', async () => {
      const r = await register('nuevo@x.es');
      assert.equal(r.status, 201);
      assert.ok(r.body.token);
      const me = await api.call('GET', '/api/users/me', { headers: { Authorization: `Bearer ${r.body.token}` } });
      assert.equal(me.status, 200);
      assert.equal(me.body.user.email, 'nuevo@x.es');
    });

    test('login con contraseña de alguien con plaza pendiente → se le envía el enlace', async () => {
      await register('ana@x.es');
      sent.length = 0;
      await CohortInvite.deleteMany({}); // como si el del registro fuese de hace días
      const r = await api.call('POST', '/api/users/login', { body: { email: 'ana@x.es', password: 'secreta1' } });
      assert.equal(r.status, 200);
      assert.equal(sent.length, 1);
      assert.deepEqual(r.body.cohortClaim, { activated: 0, emailed: 1 });
    });

    test('login con Google y email verificado → plaza activa al momento', async () => {
      googlePayload = { email: 'ana@x.es', email_verified: true, name: 'Ana', sub: 'g-123' };
      const r = await api.call('POST', '/api/users/auth/google', { body: { credential: 'id-token' } });
      assert.equal(r.status, 200);
      assert.equal((await seat()).status, 'active');
      assert.deepEqual(r.body.cohortClaim, { activated: 1, emailed: 0 });
    });

    test('Google sin email verificado → no activa, manda enlace', async () => {
      googlePayload = { email: 'ana@x.es', email_verified: false, name: 'Ana', sub: 'g-123' };
      await api.call('POST', '/api/users/auth/google', { body: { credential: 'id-token' } });
      assert.equal((await seat()).status, 'pending');
      assert.equal(sent.length, 1);
    });

    test('si el correo falla, el login sigue funcionando', async () => {
      await register('ana@x.es');
      await CohortInvite.deleteMany({});
      mailFails = true;
      const r = await api.call('POST', '/api/users/login', { body: { email: 'ana@x.es', password: 'secreta1' } });
      assert.equal(r.status, 200);
      assert.ok(r.body.token);
    });
  });
});
