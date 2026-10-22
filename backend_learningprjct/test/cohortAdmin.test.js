// Panel de administración de cohortes: CRUD, altas masivas por email, miembros e invitaciones.
import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'x'.repeat(40);
process.env.FRONTEND_URL = 'https://campus.test';

const sent = [];
const { default: nodemailer } = await import('nodemailer');
nodemailer.createTransport = () => ({ sendMail: async (opts) => { sent.push(opts); } });

const { startMemoryMongo } = await import('./helpers/memoryMongo.js');
const fx = await import('./helpers/cohortFixtures.js');
const { default: Course } = await import('../src/models/Course.js');
const { default: Cohort } = await import('../src/models/Cohort.js');
const { default: CohortInvite } = await import('../src/models/CohortInvite.js');
const { parseEmailList } = await import('../src/service/emailList.js');
const { default: cohortRoutes } = await import('../src/routes/cohort.routes.js');
const { default: courseRoutes } = await import('../src/routes/course.routes.js');

const iso = (days) => new Date(Date.now() + days * fx.DAY).toISOString();

describe('parseEmailList', () => {
  test('separa por saltos, comas, punto y coma y espacios; normaliza y deduplica', () => {
    assert.deepEqual(parseEmailList('a@x.es, A@x.es\nmal\n\n b@y.com;'), { valid: ['a@x.es', 'b@y.com'], invalid: ['mal'] });
  });
  test('acepta «Nombre <email>» como lo pega un cliente de correo', () => {
    assert.deepEqual(parseEmailList('Ana Pérez <Ana@X.es>, luis@y.com'), { valid: ['ana@x.es', 'luis@y.com'], invalid: [] });
  });
  test('texto vacío o no texto', () => {
    assert.deepEqual(parseEmailList(''), { valid: [], invalid: [] });
    assert.deepEqual(parseEmailList(undefined), { valid: [], invalid: [] });
  });
  test('los inválidos tampoco se repiten', () => {
    assert.deepEqual(parseEmailList('mal mal'), { valid: [], invalid: ['mal'] });
  });
});

describe('API de administración de cohortes', () => {
  let db;
  let api;
  let admin;
  let alumno;
  let course;

  before(async () => {
    db = await startMemoryMongo();
    api = fx.listen([['/api/cohorts', cohortRoutes], ['/api/courses', courseRoutes]]);
  });
  after(async () => {
    await api.close();
    await db.stop();
  });
  beforeEach(async () => {
    await db.reset();
    sent.length = 0;
    admin = await fx.createUser({ role: 'admin' });
    alumno = await fx.createUser();
    course = await fx.createCourse({ accessMode: 'public' });
  });

  const as = (user) => ({ headers: fx.authHeader(user) });
  const crear = (extra = {}) => api.call('POST', '/api/cohorts', {
    ...as(admin),
    body: { course: String(course._id), name: 'Carbono – Noviembre 2026', startsAt: iso(30), endsAt: iso(120), afterEnd: 'readonly', ...extra },
  });

  describe('permisos', () => {
    test('sin token 401 y usuario normal 403 en todas las rutas de admin', async () => {
      const cohort = await fx.createCohort(course);
      const rutas = [
        ['GET', `/api/cohorts?course=${course._id}`],
        ['POST', '/api/cohorts', {}],
        ['PUT', `/api/cohorts/${cohort._id}`, {}],
        ['DELETE', `/api/cohorts/${cohort._id}`],
        ['POST', `/api/cohorts/${cohort._id}/members`, { emails: 'a@x.es' }],
        ['DELETE', `/api/cohorts/${cohort._id}/members/64b0000000000000000000ff`],
        ['GET', `/api/cohorts/${cohort._id}/invites`],
        ['POST', `/api/cohorts/${cohort._id}/invites`, {}],
        ['POST', `/api/cohorts/${cohort._id}/invites/64b0000000000000000000ff/revoke`],
        ['PUT', `/api/courses/${course._id}/access`, { accessMode: 'private' }],
      ];
      for (const [method, url, body] of rutas) {
        assert.equal((await api.call(method, url, { body })).status, 401, `${method} ${url}`);
        assert.equal((await api.call(method, url, { ...as(alumno), body })).status, 403, `${method} ${url}`);
      }
    });
  });

  describe('CRUD de cohortes', () => {
    test('crear: 201, queda enlazada al curso', async () => {
      const r = await crear();
      assert.equal(r.status, 201);
      assert.equal(r.body.name, 'Carbono – Noviembre 2026');
      assert.equal(r.body.afterEnd, 'readonly');
      assert.deepEqual(r.body.counts, { active: 0, pending: 0 });
      const c = await Course.findById(course._id).lean();
      assert.deepEqual(c.cohorts.map(String), [r.body._id]);
    });

    test('crear: fin anterior al inicio, fechas inválidas, sin nombre o curso inexistente → 400', async () => {
      assert.equal((await crear({ endsAt: iso(10) })).status, 400);
      assert.equal((await crear({ startsAt: 'mañana' })).status, 400);
      assert.equal((await crear({ name: '  ' })).status, 400);
      assert.equal((await crear({ afterEnd: 'nada' })).status, 400);
      assert.equal((await crear({ course: '64b0000000000000000000ff' })).status, 400);
    });

    test('listar por curso con recuentos y nombre de los miembros con cuenta', async () => {
      await fx.createCohort(course, { members: [alumno, { email: 'pend@x.es', status: 'pending', user: null }] });
      const r = await api.call('GET', `/api/cohorts?course=${course._id}`, as(admin));
      assert.equal(r.status, 200);
      assert.equal(r.body.length, 1);
      assert.deepEqual(r.body[0].counts, { active: 1, pending: 1 });
      const activo = r.body[0].members.find((m) => m.status === 'active');
      assert.equal(activo.user.name, alumno.name);
      assert.equal(activo.user.password, undefined);
    });

    test('editar fechas y afterEnd; incoherentes → 400', async () => {
      const { body: c } = await crear();
      const ok = await api.call('PUT', `/api/cohorts/${c._id}`, { ...as(admin), body: { afterEnd: 'revoke', endsAt: iso(200) } });
      assert.equal(ok.status, 200);
      assert.equal(ok.body.afterEnd, 'revoke');
      const ko = await api.call('PUT', `/api/cohorts/${c._id}`, { ...as(admin), body: { endsAt: iso(1) } });
      assert.equal(ko.status, 400);
    });

    test('borrar con miembros activos exige ?force=1; borra invitaciones y la quita del curso', async () => {
      const cohort = await fx.createCohort(course, { members: [alumno] });
      await CohortInvite.create({ cohort: cohort._id, tokenHash: 'h'.repeat(64), expiresAt: new Date(Date.now() + fx.DAY) });
      assert.equal((await api.call('DELETE', `/api/cohorts/${cohort._id}`, as(admin))).status, 409);
      assert.equal((await api.call('DELETE', `/api/cohorts/${cohort._id}?force=1`, as(admin))).status, 200);
      assert.equal(await Cohort.countDocuments(), 0);
      assert.equal(await CohortInvite.countDocuments(), 0);
      assert.deepEqual((await Course.findById(course._id).lean()).cohorts, []);
    });
  });

  describe('modo de acceso del curso', () => {
    test('PUT /api/courses/:id/access cambia a privado y vuelve a público', async () => {
      const r = await api.call('PUT', `/api/courses/${course._id}/access`, { ...as(admin), body: { accessMode: 'private' } });
      assert.equal(r.status, 200);
      assert.equal((await Course.findById(course._id)).accessMode, 'private');
      await api.call('PUT', `/api/courses/${course._id}/access`, { ...as(admin), body: { accessMode: 'public' } });
      assert.equal((await Course.findById(course._id)).accessMode, 'public');
    });
    test('valor desconocido → 400', async () => {
      const r = await api.call('PUT', `/api/courses/${course._id}/access`, { ...as(admin), body: { accessMode: 'secreto' } });
      assert.equal(r.status, 400);
    });
  });

  describe('miembros', () => {
    test('alta masiva: resumen de añadidos, ya existentes e inválidos; todos pendientes', async () => {
      const cohort = await fx.createCohort(course, { members: [{ email: 'ya@x.es', status: 'pending', user: null }] });
      const r = await api.call('POST', `/api/cohorts/${cohort._id}/members`, {
        ...as(admin),
        body: { emails: '  Ana@X.es \n ya@x.es, ana@x.es; mal', sendEmail: false },
      });
      assert.equal(r.status, 200);
      assert.deepEqual(r.body.summary, { added: ['ana@x.es'], existing: ['ya@x.es'], invalid: ['mal'], emailed: [], emailFailed: [] });
      const ms = (await Cohort.findById(cohort._id).lean()).members;
      assert.equal(ms.length, 2);
      const ana = ms.find((m) => m.email === 'ana@x.es');
      assert.equal(ana.status, 'pending');
      assert.equal(ana.source, 'email');
      assert.equal(String(ana.addedBy), String(admin._id));
      assert.equal(sent.length, 0);
    });

    test('un email de una cuenta ya existente también queda pendiente (la activa quien controla ese email)', async () => {
      const cohort = await fx.createCohort(course);
      await api.call('POST', `/api/cohorts/${cohort._id}/members`, { ...as(admin), body: { emails: alumno.email, sendEmail: false } });
      const [m] = (await Cohort.findById(cohort._id).lean()).members;
      assert.equal(m.status, 'pending');
      assert.equal(m.user, null);
    });

    test('un usuario que ya es miembro activo con otro email cuenta como existente por su cuenta', async () => {
      const cohort = await fx.createCohort(course, { members: [alumno] });
      const r = await api.call('POST', `/api/cohorts/${cohort._id}/members`, { ...as(admin), body: { emails: alumno.email, sendEmail: false } });
      assert.deepEqual(r.body.summary.existing, [alumno.email]);
    });

    test('con sendEmail se manda una invitación nominativa a cada añadido', async () => {
      const cohort = await fx.createCohort(course);
      const r = await api.call('POST', `/api/cohorts/${cohort._id}/members`, { ...as(admin), body: { emails: 'a@x.es\nb@x.es', sendEmail: true } });
      assert.deepEqual(r.body.summary.emailed, ['a@x.es', 'b@x.es']);
      assert.equal(sent.length, 2);
      assert.deepEqual(sent.map((m) => m.to).sort(), ['a@x.es', 'b@x.es']);
      const invites = await CohortInvite.find().lean();
      assert.equal(invites.length, 2);
      assert.ok(invites.every((i) => i.maxUses === 1 && String(i.createdBy) === String(admin._id)));
    });

    test('lista vacía o solo inválidos → 400', async () => {
      const cohort = await fx.createCohort(course);
      const r = await api.call('POST', `/api/cohorts/${cohort._id}/members`, { ...as(admin), body: { emails: 'mal' } });
      assert.equal(r.status, 400);
      assert.deepEqual(r.body.summary.invalid, ['mal']);
    });

    test('quitar un miembro', async () => {
      const cohort = await fx.createCohort(course, { members: [alumno] });
      const [m] = cohort.members;
      const r = await api.call('DELETE', `/api/cohorts/${cohort._id}/members/${m._id}`, as(admin));
      assert.equal(r.status, 200);
      assert.equal((await Cohort.findById(cohort._id).lean()).members.length, 0);
      assert.equal((await api.call('DELETE', `/api/cohorts/${cohort._id}/members/${m._id}`, as(admin))).status, 404);
    });
  });

  describe('invitaciones', () => {
    test('crear de N usos: la URL solo viene en la respuesta y el listado no lleva token ni hash', async () => {
      const cohort = await fx.createCohort(course);
      const r = await api.call('POST', `/api/cohorts/${cohort._id}/invites`, { ...as(admin), body: { maxUses: 25, expiresAt: iso(10) } });
      assert.equal(r.status, 201);
      assert.match(r.body.url, /^https:\/\/campus\.test\/curso\/[\da-f]{24}\/invitacion\?token=[\w-]{43}$/);
      assert.equal(r.body.invite.maxUses, 25);
      assert.equal(r.body.invite.status, 'active');
      const list = await api.call('GET', `/api/cohorts/${cohort._id}/invites`, as(admin));
      assert.equal(list.status, 200);
      assert.equal(list.body.length, 1);
      assert.equal(list.text.includes('tokenHash'), false);
      assert.equal(list.text.includes(new URL(r.body.url).searchParams.get('token')), false);
      assert.equal(list.body[0].uses, 0);
    });

    test('individual con email y envío', async () => {
      const cohort = await fx.createCohort(course);
      const r = await api.call('POST', `/api/cohorts/${cohort._id}/invites`, { ...as(admin), body: { email: 'Ana@x.es', send: true } });
      assert.equal(r.status, 201);
      assert.equal(r.body.invite.email, 'ana@x.es');
      assert.equal(r.body.emailed, true);
      assert.equal(sent.length, 1);
      assert.ok(sent[0].html.includes(r.body.url.replace(/&/g, '&amp;')));
    });

    test('datos inválidos → 400', async () => {
      const cohort = await fx.createCohort(course);
      assert.equal((await api.call('POST', `/api/cohorts/${cohort._id}/invites`, { ...as(admin), body: { maxUses: 0 } })).status, 400);
      assert.equal((await api.call('POST', `/api/cohorts/${cohort._id}/invites`, { ...as(admin), body: { expiresAt: iso(-1) } })).status, 400);
      assert.equal((await api.call('POST', `/api/cohorts/${cohort._id}/invites`, { ...as(admin), body: { email: 'mal' } })).status, 400);
    });

    test('revocar: queda revocada en el listado; una de otra cohorte → 404', async () => {
      const cohort = await fx.createCohort(course);
      const otra = await fx.createCohort(course, { name: 'Otra' });
      const { body } = await api.call('POST', `/api/cohorts/${cohort._id}/invites`, as(admin));
      assert.equal((await api.call('POST', `/api/cohorts/${otra._id}/invites/${body.invite._id}/revoke`, as(admin))).status, 404);
      const r = await api.call('POST', `/api/cohorts/${cohort._id}/invites/${body.invite._id}/revoke`, as(admin));
      assert.equal(r.status, 200);
      assert.equal(r.body.status, 'revoked');
    });
  });
});
