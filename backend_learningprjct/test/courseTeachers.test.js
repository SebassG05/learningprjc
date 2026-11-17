// Profesores de un curso: alta por correo con enlace de un solo uso, canje, reenvío, baja y
// vinculación por Google verificado. Mongo real en memoria; el correo se captura en `sent`.
import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'x'.repeat(40);
process.env.FRONTEND_URL = 'https://campus.test';
process.env.EMAIL_USER = 'campus@test.es';
process.env.NODE_ENV = 'production';

// El transporte de correo se crea al importar mailService: se sustituye antes
const sent = [];
const { default: nodemailer } = await import('nodemailer');
nodemailer.createTransport = () => ({ sendMail: async (opts) => { sent.push(opts); } });

const { startMemoryMongo } = await import('./helpers/memoryMongo.js');
const fx = await import('./helpers/cohortFixtures.js');
const { default: Course } = await import('../src/models/Course.js');
const { hashToken } = await import('../src/service/cohortInvites.js');
const { TEACHERS_MAX } = await import('../src/config/courseCatalog.js');
const svc = await import('../src/service/courseTeachers.js');
const { addTeacher, resendTeacher, removeTeacher, previewTeacherInvite, redeemTeacherInvite, claimTeacherSlotsByGoogle, maskEmail, TeacherError } = svc;

const DAY = fx.DAY;
const tokenOf = (url) => decodeURIComponent(url.split('#token=')[1]);
const teachersOf = async (course) => (await Course.findById(course._id).select('+profesores').lean()).profesores;
const rejectsWith = (promise, code, status) =>
  assert.rejects(promise, (err) => err instanceof TeacherError && err.code === code && (status === undefined || err.status === status));

describe('profesores de un curso', () => {
  let db;
  let course;
  let admin;

  before(async () => { db = await startMemoryMongo(); });
  after(async () => { await db.stop(); });
  beforeEach(async () => {
    await db.reset();
    sent.length = 0;
    course = await fx.createCourse({ title: 'Suelos <b>y</b> clima' });
    admin = await fx.createUser({ role: 'admin' });
  });

  test('normaliza y rechaza correos no válidos', async () => {
    const { teacher } = await addTeacher({ courseId: course._id, email: '  Laura.Martin@UCO.es ', addedBy: admin._id });
    assert.equal(teacher.email, 'laura.martin@uco.es');
    await rejectsWith(addTeacher({ courseId: course._id, email: 'no-es-un-correo', addedBy: admin._id }), 'bad-email', 400);
    await rejectsWith(addTeacher({ courseId: course._id, email: '', addedBy: admin._id }), 'bad-email', 400);
    assert.equal((await teachersOf(course)).length, 1);
  });

  test('no duplica (dos addTeacher a la vez → uno 409)', async () => {
    const results = await Promise.allSettled([
      addTeacher({ courseId: course._id, email: 'a@uco.es', addedBy: admin._id }),
      addTeacher({ courseId: course._id, email: 'A@uco.es', addedBy: admin._id }),
    ]);
    assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
    const failed = results.find((r) => r.status === 'rejected');
    assert.equal(failed.reason.code, 'duplicate');
    assert.equal(failed.reason.status, 409);
    assert.equal((await teachersOf(course)).length, 1);
  });

  test('undécimo profesor → limit', async () => {
    for (let i = 0; i < TEACHERS_MAX; i += 1) {
      await addTeacher({ courseId: course._id, email: `p${i}@uco.es`, addedBy: admin._id });
    }
    await rejectsWith(addTeacher({ courseId: course._id, email: 'extra@uco.es', addedBy: admin._id }), 'limit', 409);
    assert.equal((await teachersOf(course)).length, TEACHERS_MAX);
  });

  test('curso inexistente → not-found', async () => {
    await rejectsWith(addTeacher({ courseId: '64d000000000000000000001', email: 'a@uco.es', addedBy: admin._id }), 'not-found', 404);
  });

  test('addTeacher envía un correo con /profesor/invitacion#token=', async () => {
    const { url } = await addTeacher({ courseId: course._id, email: 'laura@uco.es', addedBy: admin._id });
    assert.match(url, /^https:\/\/campus\.test\/profesor\/invitacion#token=[\w-]{43}$/);
    assert.equal(sent.length, 1);
    assert.equal(sent[0].to, 'laura@uco.es');
    assert.equal(sent[0].subject, 'Te han añadido como profesor del curso Suelos <b>y</b> clima');
    assert.ok(sent[0].text.includes(url));
    assert.ok(sent[0].html.includes('Activar acceso de profesor'));
    assert.ok(sent[0].html.includes('/profesor/invitacion#token='));
    assert.ok(!sent[0].html.includes('<b>y</b>'), 'el título del curso va escapado en el HTML');
    assert.ok(sent[0].text.includes('Si aún no tienes cuenta en el Campus, el enlace te llevará a crearla. Caduca el'));
  });

  test('el token guardado es el hash, no el token', async () => {
    const now = new Date('2026-12-01T10:00:00Z');
    const { url } = await addTeacher({ courseId: course._id, email: 'laura@uco.es', addedBy: admin._id, now });
    const token = tokenOf(url);
    const [row] = await teachersOf(course);
    assert.equal(row.tokenHash, hashToken(token));
    assert.notEqual(row.tokenHash, token);
    assert.equal(row.status, 'pending');
    assert.equal(row.tokenExpiresAt.getTime(), now.getTime() + 14 * DAY);
    assert.equal(String(row.addedBy), String(admin._id));
    assert.ok(!JSON.stringify(row).includes(token));
  });

  test('canje válido activa y borra tokenHash', async () => {
    const { url } = await addTeacher({ courseId: course._id, email: 'laura@uco.es', addedBy: admin._id });
    const user = await fx.createUser({ email: 'laura@uco.es' });
    const out = await redeemTeacherInvite({ token: tokenOf(url), user });
    assert.deepEqual({ courseId: String(out.courseId), mismatch: out.mismatch }, { courseId: String(course._id), mismatch: false });
    const [row] = await teachersOf(course);
    assert.equal(row.status, 'active');
    assert.equal(String(row.userId), String(user._id));
    assert.equal(row.tokenHash, null);
    assert.ok(row.linkedAt instanceof Date);
    assert.equal(sent.length, 1, 'sin discrepancia no hay segundo correo');
  });

  test('canje caducado → expired', async () => {
    const now = new Date('2026-12-01T10:00:00Z');
    const { url } = await addTeacher({ courseId: course._id, email: 'laura@uco.es', addedBy: admin._id, now });
    const user = await fx.createUser({ email: 'laura@uco.es' });
    const later = new Date(now.getTime() + 15 * DAY);
    await rejectsWith(redeemTeacherInvite({ token: tokenOf(url), user, now: later }), 'expired', 410);
    await rejectsWith(previewTeacherInvite(tokenOf(url), later), 'expired', 410);
    assert.equal((await teachersOf(course))[0].status, 'pending');
  });

  test('token desconocido → invalid', async () => {
    await rejectsWith(previewTeacherInvite('nada'), 'invalid', 404);
    await rejectsWith(previewTeacherInvite(undefined), 'invalid', 404);
  });

  test('dos canjes a la vez → uno activa, otro used', async () => {
    const { url } = await addTeacher({ courseId: course._id, email: 'laura@uco.es', addedBy: admin._id });
    const u1 = await fx.createUser({ email: 'laura@uco.es' });
    const u2 = await fx.createUser();
    const results = await Promise.allSettled([
      redeemTeacherInvite({ token: tokenOf(url), user: u1 }),
      redeemTeacherInvite({ token: tokenOf(url), user: u2 }),
    ]);
    assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
    assert.equal(results.find((r) => r.status === 'rejected').reason.code, 'used');
    const rows = await teachersOf(course);
    assert.equal(rows.filter((r) => r.status === 'active').length, 1);
    await rejectsWith(previewTeacherInvite(tokenOf(url)), 'used', 410);
  });

  test('previsualiza con el correo enmascarado', async () => {
    const { url } = await addTeacher({ courseId: course._id, email: 'laura.martin@uco.es', addedBy: admin._id });
    const preview = await previewTeacherInvite(tokenOf(url));
    assert.equal(String(preview.courseId), String(course._id));
    assert.equal(preview.courseTitle, 'Suelos <b>y</b> clima');
    assert.equal(preview.emailMasked, 'l•••@uco.es');
    assert.ok(!JSON.stringify(preview).includes('laura.martin'));
  });

  test('reenviar invalida el enlace anterior', async () => {
    const { url: first } = await addTeacher({ courseId: course._id, email: 'laura@uco.es', addedBy: admin._id });
    const [row] = await teachersOf(course);
    sent.length = 0;
    const { url: second } = await resendTeacher({ courseId: course._id, teacherId: row._id });
    assert.notEqual(tokenOf(first), tokenOf(second));
    assert.equal(sent.length, 1);
    await rejectsWith(previewTeacherInvite(tokenOf(first)), 'invalid', 404);
    const user = await fx.createUser({ email: 'laura@uco.es' });
    await rejectsWith(redeemTeacherInvite({ token: tokenOf(first), user }), 'invalid', 404);
    await redeemTeacherInvite({ token: tokenOf(second), user });
    await rejectsWith(resendTeacher({ courseId: course._id, teacherId: row._id }), 'already-linked', 409);
    await rejectsWith(resendTeacher({ courseId: course._id, teacherId: '64d0000000000000000000ff' }), 'not-found', 404);
  });

  test('quitar a un pendiente hace que su enlace dé invalid', async () => {
    const { url } = await addTeacher({ courseId: course._id, email: 'laura@uco.es', addedBy: admin._id });
    const [row] = await teachersOf(course);
    await removeTeacher({ courseId: course._id, teacherId: row._id });
    assert.equal((await teachersOf(course)).length, 0);
    await rejectsWith(previewTeacherInvite(tokenOf(url)), 'invalid', 404);
    const user = await fx.createUser({ email: 'laura@uco.es' });
    await rejectsWith(redeemTeacherInvite({ token: tokenOf(url), user }), 'invalid', 404);
    await rejectsWith(removeTeacher({ courseId: course._id, teacherId: row._id }), 'not-found', 404);
  });

  test('canje con cuenta de otro correo → mismatch y correo a la dirección invitada', async () => {
    const { url } = await addTeacher({ courseId: course._id, email: 'laura@uco.es', addedBy: admin._id });
    const user = await fx.createUser({ email: 'otra.persona@gmail.com' });
    sent.length = 0;
    const out = await redeemTeacherInvite({ token: tokenOf(url), user });
    assert.equal(out.mismatch, true);
    assert.equal(sent.length, 1);
    assert.equal(sent[0].to, 'laura@uco.es');
    assert.equal(sent[0].subject, 'Tu acceso de profesor de Suelos <b>y</b> clima se ha activado');
    assert.ok(sent[0].text.includes('Se activó en la cuenta o•••@gmail.com. Si no has sido tú, responde a este correo.'));
    assert.ok(!sent[0].text.includes('otra.persona'));
    assert.equal((await teachersOf(course))[0].status, 'active');
  });

  test('quien ya es profesor activo del curso con otra fila → already-teacher', async () => {
    const user = await fx.createUser({ email: 'laura@uco.es' });
    const first = await addTeacher({ courseId: course._id, email: 'laura@uco.es', addedBy: admin._id });
    await redeemTeacherInvite({ token: tokenOf(first.url), user });
    const second = await addTeacher({ courseId: course._id, email: 'otro@uco.es', addedBy: admin._id });
    await rejectsWith(redeemTeacherInvite({ token: tokenOf(second.url), user }), 'already-teacher', 409);
    assert.equal((await teachersOf(course)).find((r) => r.email === 'otro@uco.es').status, 'pending');
  });

  test('Google verificado activa sin enlace', async () => {
    const other = await fx.createCourse({ title: 'Otro curso' });
    await addTeacher({ courseId: course._id, email: 'laura@uco.es', addedBy: admin._id });
    await addTeacher({ courseId: other._id, email: 'laura@uco.es', addedBy: admin._id });
    await addTeacher({ courseId: other._id, email: 'ajeno@uco.es', addedBy: admin._id });
    const user = await fx.createUser({ email: 'laura@uco.es' });
    assert.equal(await claimTeacherSlotsByGoogle(user, { verified: true }), 2);
    for (const c of [course, other]) {
      const row = (await teachersOf(c)).find((r) => r.email === 'laura@uco.es');
      assert.equal(row.status, 'active');
      assert.equal(String(row.userId), String(user._id));
      assert.equal(row.tokenHash, null);
      assert.ok(row.linkedAt);
    }
    assert.equal((await teachersOf(other)).find((r) => r.email === 'ajeno@uco.es').status, 'pending');
  });

  test('Google no verificado no activa', async () => {
    await addTeacher({ courseId: course._id, email: 'laura@uco.es', addedBy: admin._id });
    const user = await fx.createUser({ email: 'laura@uco.es' });
    assert.equal(await claimTeacherSlotsByGoogle(user, { verified: false }), 0);
    assert.equal(await claimTeacherSlotsByGoogle(user), 0);
    assert.equal((await teachersOf(course))[0].status, 'pending');
  });

  test('claimTeacherSlotsSafely nunca lanza', async () => {
    assert.equal(await svc.claimTeacherSlotsSafely(null, { verified: true }), 0);
    assert.equal(await svc.claimTeacherSlotsSafely({ _id: 'no-id', email: 'a@b.es' }, { verified: true }), 0);
  });

  test('maskEmail', () => {
    assert.equal(maskEmail('laura.martin@uco.es'), 'l•••@uco.es');
    assert.equal(maskEmail('A@x.es'), 'a•••@x.es');
    assert.equal(maskEmail('sin-arroba'), '•••');
  });
});
