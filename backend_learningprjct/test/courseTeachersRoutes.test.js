// Rutas de profesores: gestión (admin), invitación (vista previa y canje), «mis cursos» y Google.
import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'x'.repeat(40);
process.env.CLOUDINARY_CLOUD_NAME = 'demo-cloud';
process.env.CLOUDINARY_API_KEY = '123';
process.env.CLOUDINARY_API_SECRET = 'secreto-de-prueba';

const sent = [];
const { default: nodemailer } = await import('nodemailer');
nodemailer.createTransport = () => ({ sendMail: async (opts) => { sent.push(opts); } });
const { OAuth2Client } = await import('google-auth-library');
OAuth2Client.prototype.verifyIdToken = async ({ idToken }) => ({ getPayload: () => JSON.parse(idToken) });

const { startMemoryMongo } = await import('./helpers/memoryMongo.js');
const fx = await import('./helpers/cohortFixtures.js');
const { default: Course } = await import('../src/models/Course.js');
const { default: courseRoutes } = await import('../src/routes/course.routes.js');
const { default: userRoutes } = await import('../src/routes/user.routes.js');
const { buildProfesorRouter } = await import('../src/routes/profesor.routes.js');

const HIGH = { vista: 1000, canjear: 1000 };
const tokenOf = (mail) => /#token=([\w-]+)/.exec(`${mail.text ?? ''} ${mail.html ?? ''}`)[1];

describe('rutas de profesores', () => {
  let db;
  let api;
  let admin;
  let course;
  before(async () => {
    db = await startMemoryMongo();
    api = fx.listen([
      ['/api/courses', courseRoutes],
      ['/api/users', userRoutes],
      ['/api/profesor', buildProfesorRouter({ limits: HIGH })],
    ]);
  });
  after(async () => {
    await api.close();
    await db.stop();
  });
  beforeEach(async () => {
    await db.reset();
    sent.length = 0;
    admin = await fx.createUser({ role: 'admin' });
    course = await fx.createCourse({ accessMode: 'private' });
  });

  const add = (email, who = admin) => api.call('POST', `/api/courses/${course._id}/profesores`, { headers: fx.authHeader(who), body: { email } });
  const invite = async (email) => {
    await add(email);
    return tokenOf(sent.at(-1));
  };

  test('un usuario no admin recibe 403 en las cuatro rutas admin', async () => {
    const user = await fx.createUser();
    const h = fx.authHeader(user);
    const base = `/api/courses/${course._id}/profesores`;
    const id = '64b000000000000000000001';
    assert.equal((await api.call('GET', base, { headers: h })).status, 403);
    assert.equal((await api.call('POST', base, { headers: h, body: { email: 'a@b.es' } })).status, 403);
    assert.equal((await api.call('POST', `${base}/${id}/reenviar`, { headers: h })).status, 403);
    assert.equal((await api.call('DELETE', `${base}/${id}`, { headers: h })).status, 403);
  });

  test('alta: 201 con la fila sin url ni hashes; GET lista sin tokenHash y con cuenta si está vinculado', async () => {
    const r = await add('profe@uco.es');
    assert.equal(r.status, 201);
    assert.equal(r.body.email, 'profe@uco.es');
    assert.equal(r.body.status, 'pending');
    assert.match(r.headers.get('cache-control'), /private, no-store/);
    const token = tokenOf(sent.at(-1));
    assert.equal(r.text.includes(token), false);
    assert.equal(r.text.includes('url'), false);

    const profe = await fx.createUser({ email: 'profe@uco.es' });
    const red = await api.call('POST', '/api/profesor/invitacion/canjear', { headers: fx.authHeader(profe), body: { token } });
    assert.equal(red.status, 200);

    const list = await api.call('GET', `/api/courses/${course._id}/profesores`, { headers: fx.authHeader(admin) });
    assert.equal(list.status, 200);
    assert.equal(list.body.length, 1);
    assert.deepEqual(list.body[0].cuenta, { name: profe.name, email: profe.email });
    assert.equal(list.text.includes('tokenHash'), false);
    assert.equal(list.text.includes('redeemedTokenHash'), false);
    assert.equal(list.text.includes('userId'), false);
    assert.match(list.headers.get('cache-control'), /private, no-store/);
  });

  test('alta duplicada -> 409; correo mal formado -> 400; reenviar y borrar', async () => {
    assert.equal((await add('profe@uco.es')).status, 201);
    const dup = await add('PROFE@uco.es');
    assert.equal(dup.status, 409);
    assert.equal(dup.body.code, 'duplicate');
    assert.equal((await add('no-es-correo')).status, 400);

    const list = await api.call('GET', `/api/courses/${course._id}/profesores`, { headers: fx.authHeader(admin) });
    const id = list.body[0]._id;
    const re = await api.call('POST', `/api/courses/${course._id}/profesores/${id}/reenviar`, { headers: fx.authHeader(admin) });
    assert.equal(re.status, 200);
    assert.equal(re.text.includes(tokenOf(sent.at(-1))), false);
    const del = await api.call('DELETE', `/api/courses/${course._id}/profesores/${id}`, { headers: fx.authHeader(admin) });
    assert.equal(del.status, 200);
    const bad = await api.call('DELETE', `/api/courses/${course._id}/profesores/no-id`, { headers: fx.authHeader(admin) });
    assert.equal(bad.status, 400);
  });

  test('vista previa: token inválido 404, caducado 410, válido con correo enmascarado', async () => {
    const token = await invite('profe@uco.es');
    const ok = await api.call('POST', '/api/profesor/invitacion/vista', { body: { token } });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.courseTitle, 'Curso');
    assert.equal(ok.text.includes('profe@uco.es'), false);
    assert.match(ok.headers.get('cache-control'), /private, no-store/);

    const bad = await api.call('POST', '/api/profesor/invitacion/vista', { body: { token: 'nope' } });
    assert.equal(bad.status, 404);
    assert.equal((await api.call('POST', '/api/profesor/invitacion/vista', { body: {} })).status, 400);

    await Course.updateOne({ _id: course._id }, { $set: { 'profesores.0.tokenExpiresAt': new Date(Date.now() - 1000) } });
    const exp = await api.call('POST', '/api/profesor/invitacion/vista', { body: { token } });
    assert.equal(exp.status, 410);
    assert.equal(exp.body.code, 'expired');
  });

  test('límites reales: 31.ª vista previa 429 y 11.º canje 429', async () => {
    const real = fx.listen([['/api/profesor', buildProfesorRouter()]]);
    try {
      for (let i = 0; i < 30; i += 1) {
        const r = await real.call('POST', '/api/profesor/invitacion/vista', { body: { token: 'nope' } });
        assert.equal(r.status, 404);
      }
      const r31 = await real.call('POST', '/api/profesor/invitacion/vista', { body: { token: 'nope' } });
      assert.equal(r31.status, 429);
      assert.match(r31.headers.get('cache-control'), /no-store/);

      const user = await fx.createUser();
      for (let i = 0; i < 10; i += 1) {
        const r = await real.call('POST', '/api/profesor/invitacion/canjear', { headers: fx.authHeader(user), body: { token: 'nope' } });
        assert.equal(r.status, 404);
      }
      const r11 = await real.call('POST', '/api/profesor/invitacion/canjear', { headers: fx.authHeader(user), body: { token: 'nope' } });
      assert.equal(r11.status, 429);
    } finally {
      await real.close();
    }
  });

  test('canje sin sesión -> 401; con sesión -> 200 y el usuario lee el curso privado como profesor', async () => {
    const token = await invite('profe@uco.es');
    assert.equal((await api.call('POST', '/api/profesor/invitacion/canjear', { body: { token } })).status, 401);

    const otra = await fx.createUser({ email: 'otra@uco.es' });
    const r = await api.call('POST', '/api/profesor/invitacion/canjear', { headers: fx.authHeader(otra), body: { token } });
    assert.equal(r.status, 200);
    assert.equal(String(r.body.courseId), String(course._id));
    assert.equal(r.body.mismatch, true);

    const get = await api.call('GET', `/api/courses/${course._id}`, { headers: fx.authHeader(otra) });
    assert.equal(get.body.access.reason, 'teacher');

    const again = await api.call('POST', '/api/profesor/invitacion/canjear', { headers: fx.authHeader(otra), body: { token } });
    assert.equal(again.status, 410);
  });

  test('/api/profesor/cursos solo lista cursos con fila activa del usuario', async () => {
    const token = await invite('profe@uco.es');
    const otro = await fx.createCourse({ accessMode: 'private', title: 'Otro' });
    const profe = await fx.createUser({ email: 'profe@uco.es' });
    assert.equal((await api.call('GET', '/api/profesor/cursos')).status, 401);
    const antes = await api.call('GET', '/api/profesor/cursos', { headers: fx.authHeader(profe) });
    assert.deepEqual(antes.body, []); // fila aún pendiente

    await api.call('POST', '/api/profesor/invitacion/canjear', { headers: fx.authHeader(profe), body: { token } });
    const r = await api.call('GET', '/api/profesor/cursos', { headers: fx.authHeader(profe) });
    assert.equal(r.status, 200);
    assert.equal(r.body.length, 1);
    assert.equal(r.body[0]._id, String(course._id));
    assert.equal(r.body[0].title, 'Curso');
    assert.equal(r.body[0].abiertas, 0);
    assert.equal(r.body[0].reportadas, 0);
    assert.equal(r.body.some((c) => c._id === String(otro._id)), false);
    assert.equal(r.text.includes('profesores'), false);
    assert.match(r.headers.get('cache-control'), /private, no-store/);
  });

  test('Google vincula las filas pendientes del correo verificado', async () => {
    await add('laura@uco.es');
    const payload = { sub: '1098765', email: 'laura@uco.es', email_verified: true, name: 'Laura' };
    const r = await api.call('POST', '/api/users/auth/google', { body: { credential: JSON.stringify(payload) } });
    assert.equal(r.status, 200);
    const row = (await Course.findById(course._id).select('+profesores').lean()).profesores[0];
    assert.equal(row.status, 'active');
  });
});
