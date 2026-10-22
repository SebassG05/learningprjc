// Control de acceso en ficha, catálogo, vídeo, inscripción y «mis cursos» (Mongo real en memoria).
import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'x'.repeat(40);
process.env.CLOUDINARY_CLOUD_NAME = 'demo-cloud';
process.env.CLOUDINARY_API_KEY = '123';
process.env.CLOUDINARY_API_SECRET = 'secreto-de-prueba';

const { startMemoryMongo } = await import('./helpers/memoryMongo.js');
const fx = await import('./helpers/cohortFixtures.js');
const { default: Course } = await import('../src/models/Course.js');
const { default: UserProgress } = await import('../src/models/UserProgress.js');
const { default: courseRoutes } = await import('../src/routes/course.routes.js');
const { default: userRoutes } = await import('../src/routes/user.routes.js');
const { COURSE_VIDEOS } = await import('../src/config/courseVideos.js');
const { TERMS } = await import('../src/content/terms.js');

const CARBONO = '69d50406663e8648d7ee1f08';
const hasFiles = (text) => text.includes('learning-platform/materiales');

describe('rutas de curso con acceso por cohortes', () => {
  let db;
  let api;
  before(async () => {
    db = await startMemoryMongo();
    api = fx.listen([['/api/courses', courseRoutes], ['/api/users', userRoutes]]);
  });
  after(async () => {
    await api.close();
    await db.stop();
  });
  beforeEach(() => db.reset());

  describe('GET /api/courses/:id', () => {
    test('privado sin sesión: ficha sin URLs de materiales y access anonymous', async () => {
      const course = await fx.createCourse({ accessMode: 'private' });
      const r = await api.call('GET', `/api/courses/${course._id}`);
      assert.equal(r.status, 200);
      assert.equal(hasFiles(r.text), false);
      assert.equal(r.body.title, 'Curso');
      assert.equal(r.body.temas[0].materiales[0].titulo, 'Guía');
      assert.deepEqual(r.body.access, { level: 'denied', reason: 'anonymous' });
      assert.match(r.headers.get('cache-control'), /private/);
    });

    test('privado, usuario que no es miembro: sin URLs, not-member', async () => {
      const course = await fx.createCourse({ accessMode: 'private' });
      const luis = await fx.createUser();
      await fx.createCohort(course, { members: [await fx.createUser()] });
      const r = await api.call('GET', `/api/courses/${course._id}`, { headers: fx.authHeader(luis) });
      assert.equal(hasFiles(r.text), false);
      assert.equal(r.body.access.reason, 'not-member');
    });

    test('privado, miembro dentro de fechas: contenido completo', async () => {
      const course = await fx.createCourse({ accessMode: 'private' });
      const ana = await fx.createUser();
      await fx.createCohort(course, { members: [ana] });
      const r = await api.call('GET', `/api/courses/${course._id}`, { headers: fx.authHeader(ana) });
      assert.equal(hasFiles(r.text), true);
      assert.equal(r.body.access.level, 'full');
      assert.equal(r.body.access.reason, 'member');
    });

    test('privado, miembro antes de startsAt: plaza reservada sin contenido', async () => {
      const course = await fx.createCourse({ accessMode: 'private' });
      const ana = await fx.createUser();
      await fx.createCohort(course, { window: 'future', members: [ana] });
      const r = await api.call('GET', `/api/courses/${course._id}`, { headers: fx.authHeader(ana) });
      assert.equal(hasFiles(r.text), false);
      assert.equal(r.body.access.reason, 'reserved');
      assert.ok(r.body.access.startsAt);
    });

    test('privado, miembro tras endsAt con readonly: ve el contenido', async () => {
      const course = await fx.createCourse({ accessMode: 'private' });
      const ana = await fx.createUser();
      await fx.createCohort(course, { window: 'ended', members: [ana] });
      const r = await api.call('GET', `/api/courses/${course._id}`, { headers: fx.authHeader(ana) });
      assert.equal(hasFiles(r.text), true);
      assert.equal(r.body.access.level, 'readonly');
    });

    test('privado, miembro tras endsAt con revoke: sin contenido', async () => {
      const course = await fx.createCourse({ accessMode: 'private' });
      const ana = await fx.createUser();
      await fx.createCohort(course, { window: 'ended', afterEnd: 'revoke', members: [ana] });
      const r = await api.call('GET', `/api/courses/${course._id}`, { headers: fx.authHeader(ana) });
      assert.equal(hasFiles(r.text), false);
      assert.equal(r.body.access.reason, 'revoked');
    });

    test('admin ve el curso privado completo', async () => {
      const course = await fx.createCourse({ accessMode: 'private' });
      const admin = await fx.createUser({ role: 'admin' });
      const r = await api.call('GET', `/api/courses/${course._id}`, { headers: fx.authHeader(admin) });
      assert.equal(hasFiles(r.text), true);
      assert.equal(r.body.access.reason, 'admin');
    });

    test('usuario desactivado no cuenta como miembro', async () => {
      const course = await fx.createCourse({ accessMode: 'private' });
      const ana = await fx.createUser({ activo: false });
      await fx.createCohort(course, { members: [ana] });
      const r = await api.call('GET', `/api/courses/${course._id}`, { headers: fx.authHeader(ana) });
      assert.equal(hasFiles(r.text), false);
    });

    test('curso público: misma respuesta que antes, sin campo access', async () => {
      const course = await fx.createCourse({ accessMode: 'public' });
      const r = await api.call('GET', `/api/courses/${course._id}`);
      assert.equal(r.status, 200);
      assert.deepEqual(r.body, JSON.parse(JSON.stringify(await Course.findById(course._id))));
      assert.equal('access' in r.body, false);
    });

    test('id inválido → 404', async () => {
      const r = await api.call('GET', '/api/courses/xyz');
      assert.equal(r.status, 404);
    });

    test('id inexistente → 404', async () => {
      const r = await api.call('GET', '/api/courses/64b0000000000000000000ff');
      assert.equal(r.status, 404);
    });
  });

  describe('GET /api/courses (catálogo)', () => {
    test('quita URLs de los privados y deja las de los públicos', async () => {
      const priv = await fx.createCourse({ accessMode: 'private', title: 'Privado' });
      await fx.createCourse({ accessMode: 'public', title: 'Público' });
      const r = await api.call('GET', '/api/courses');
      assert.equal(r.status, 200);
      const p = r.body.find((c) => c.title === 'Privado');
      const q = r.body.find((c) => c.title === 'Público');
      assert.equal(hasFiles(JSON.stringify(p)), false);
      assert.equal(hasFiles(JSON.stringify(q)), true);
      assert.equal(String(p._id), String(priv._id));
    });

    test('un admin con sesión recibe los privados completos (editor de cursos)', async () => {
      await fx.createCourse({ accessMode: 'private', title: 'Privado' });
      const admin = await fx.createUser({ role: 'admin' });
      const r = await api.call('GET', '/api/courses', { headers: fx.authHeader(admin) });
      assert.equal(hasFiles(JSON.stringify(r.body.find((c) => c.title === 'Privado'))), true);
    });

    test('un miembro no recibe URLs en el catálogo (solo en la ficha)', async () => {
      const priv = await fx.createCourse({ accessMode: 'private', title: 'Privado' });
      const ana = await fx.createUser();
      await fx.createCohort(priv, { members: [ana] });
      const r = await api.call('GET', '/api/courses', { headers: fx.authHeader(ana) });
      assert.equal(hasFiles(r.text), false);
    });
  });

  describe('GET /api/courses/:id/video', () => {
    test('privado: inscrito pero no miembro → preview', async () => {
      const course = await Course.create({ _id: CARBONO, title: 'Carbono', description: 'd', accessMode: 'private', isOpen: true });
      const luis = await fx.createUser();
      await UserProgress.create({ userId: luis._id, courseId: course._id });
      assert.ok(COURSE_VIDEOS[CARBONO]);
      const r = await api.call('GET', `/api/courses/${CARBONO}/video`, { headers: fx.authHeader(luis) });
      assert.equal(r.status, 200);
      assert.equal(r.body.mode, 'preview');
    });

    test('privado: miembro inscrito y curso abierto → full', async () => {
      const course = await Course.create({ _id: CARBONO, title: 'Carbono', description: 'd', accessMode: 'private', isOpen: true });
      const ana = await fx.createUser();
      await fx.createCohort(course, { members: [ana] });
      await UserProgress.create({ userId: ana._id, courseId: course._id });
      const r = await api.call('GET', `/api/courses/${CARBONO}/video`, { headers: fx.authHeader(ana) });
      assert.equal(r.body.mode, 'full');
    });
  });

  describe('POST /api/users/enroll/:courseId', () => {
    const terms = { acceptTerms: true, termsVersion: TERMS.version };

    test('privado: no miembro → 403 sin inscripción', async () => {
      const course = await fx.createCourse({ accessMode: 'private' });
      const luis = await fx.createUser();
      const r = await api.call('POST', `/api/users/enroll/${course._id}`, { headers: fx.authHeader(luis), body: terms });
      assert.equal(r.status, 403);
      assert.equal(r.body.access.reason, 'not-member');
      assert.equal(await UserProgress.countDocuments(), 0);
    });

    test('privado: plaza reservada (antes de startsAt) → 403', async () => {
      const course = await fx.createCourse({ accessMode: 'private' });
      const ana = await fx.createUser();
      await fx.createCohort(course, { window: 'future', members: [ana] });
      const r = await api.call('POST', `/api/users/enroll/${course._id}`, { headers: fx.authHeader(ana), body: terms });
      assert.equal(r.status, 403);
      assert.equal(r.body.access.reason, 'reserved');
    });

    test('privado: edición cerrada en solo lectura → 403 (no hay inscripciones nuevas)', async () => {
      const course = await fx.createCourse({ accessMode: 'private' });
      const ana = await fx.createUser();
      await fx.createCohort(course, { window: 'ended', members: [ana] });
      const r = await api.call('POST', `/api/users/enroll/${course._id}`, { headers: fx.authHeader(ana), body: terms });
      assert.equal(r.status, 403);
    });

    test('privado: miembro dentro de fechas → 200', async () => {
      const course = await fx.createCourse({ accessMode: 'private' });
      const ana = await fx.createUser();
      await fx.createCohort(course, { members: [ana] });
      const r = await api.call('POST', `/api/users/enroll/${course._id}`, { headers: fx.authHeader(ana), body: terms });
      assert.equal(r.status, 200);
      assert.equal(await UserProgress.countDocuments({ userId: ana._id }), 1);
    });

    test('público: sigue inscribiendo como antes', async () => {
      const course = await fx.createCourse({ accessMode: 'public' });
      const luis = await fx.createUser();
      const r = await api.call('POST', `/api/users/enroll/${course._id}`, { headers: fx.authHeader(luis), body: terms });
      assert.equal(r.status, 200);
    });
  });

  describe('GET /api/users/enrollments', () => {
    test('un curso privado al que ya no tiene acceso llega sin URLs', async () => {
      const course = await fx.createCourse({ accessMode: 'private' });
      const ana = await fx.createUser();
      await fx.createCohort(course, { window: 'ended', afterEnd: 'revoke', members: [ana] });
      await UserProgress.create({ userId: ana._id, courseId: course._id });
      const r = await api.call('GET', '/api/users/enrollments', { headers: fx.authHeader(ana) });
      assert.equal(r.status, 200);
      assert.equal(r.body.enrollments.length, 1);
      assert.equal(hasFiles(r.text), false);
    });

    test('un curso público inscrito llega completo', async () => {
      const course = await fx.createCourse({ accessMode: 'public' });
      const ana = await fx.createUser();
      await UserProgress.create({ userId: ana._id, courseId: course._id });
      const r = await api.call('GET', '/api/users/enrollments', { headers: fx.authHeader(ana) });
      assert.equal(hasFiles(r.text), true);
    });
  });
});
