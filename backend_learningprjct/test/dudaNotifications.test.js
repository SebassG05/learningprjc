// Avisos por correo de Dudas: profesores (duda nueva) y autor (respuesta), sin duplicados ni fugas.
// Transporte de correo simulado antes de importar nada que cargue mailService. Ejecutar: npm test
import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'x'.repeat(40);
process.env.CLOUDINARY_CLOUD_NAME = 'demo-cloud';
process.env.CLOUDINARY_API_KEY = '123';
process.env.CLOUDINARY_API_SECRET = 'secreto-de-prueba';
process.env.EMAIL_USER = 'campus@test.es';
process.env.FRONTEND_URL = 'https://campus.test';

const sent = [];
let failMail = false;
const { default: nodemailer } = await import('nodemailer');
nodemailer.createTransport = () => ({
  sendMail: async (opts) => {
    if (failMail) throw new Error('SMTP caído');
    sent.push(opts);
  },
});

const { startMemoryMongo } = await import('./helpers/memoryMongo.js');
const fx = await import('./helpers/cohortFixtures.js');
const { default: Course } = await import('../src/models/Course.js');
const { default: Duda } = await import('../src/models/Duda.js');
const { notificarDudaNueva, notificarRespuesta, esperarAvisos } = await import('../src/service/dudaNotifications.js');
const { buildDudaRouters } = await import('../src/routes/duda.routes.js');

const HIGH = { preguntas: 10000, respuestas: 10000, ediciones: 10000, reportes: 10000 };

const linkTeacher = (course, user) => Course.updateOne({ _id: course._id }, { $push: { profesores: {
  email: user.email, status: 'active', userId: user._id, tokenHash: 'h', addedBy: user._id,
} } });

describe('avisos por correo de dudas', () => {
  let db; let api; let course; let temaId; let alumno; let profe; let profe2; let admin;
  before(async () => {
    db = await startMemoryMongo();
    const r = buildDudaRouters({ limits: HIGH });
    api = fx.listen([['/api/courses/:id/dudas', r.courseRouter], ['/api/dudas', r.dudaRouter]]);
  });
  after(async () => {
    await api.close();
    await db.stop();
  });
  beforeEach(async () => {
    await db.reset();
    sent.length = 0;
    failMail = false;
    alumno = await fx.createUser();
    profe = await fx.createUser();
    profe2 = await fx.createUser();
    admin = await fx.createUser({ role: 'admin' });
    course = await fx.createCourse({ accessMode: 'private', title: 'Carbono' });
    temaId = String(course.temas[0]._id);
    await fx.createCohort(course, { window: 'open', members: [alumno] });
  });

  const duda = (extra = {}) => Duda.create({
    cursoId: course._id, temaId, autorId: alumno._id, autorNombre: 'Usuario A.', titulo: 'Mi duda', texto: 'Texto de la duda', ...extra,
  });
  const respond = (d, who, texto = 'Respuesta') => api.call('POST', `/api/dudas/${d._id}/respuestas`, { headers: fx.authHeader(who), body: { texto } });

  describe('duda nueva', () => {
    test('un correo por profesor vinculado (los pendientes no)', async () => {
      await linkTeacher(course, profe);
      await linkTeacher(course, profe2);
      await Course.updateOne({ _id: course._id }, { $push: { profesores: { email: 'pendiente@x.es', status: 'pending', tokenHash: 'h', addedBy: admin._id } } });
      const d = await duda();
      assert.equal(await notificarDudaNueva(d), 2);
      assert.equal(sent.length, 2);
      assert.deepEqual(sent.map((m) => m.to).sort(), [profe.email, profe2.email].sort());
      for (const m of sent) {
        assert.equal(typeof m.to, 'string');
        assert.equal(m.subject, 'Nueva duda en Carbono · Tema 1');
        assert.ok(m.html.includes(`https://campus.test/curso/${course._id}/dudas#duda-${d._id}`));
        assert.ok(m.html.includes('Responder'));
        assert.ok(!m.html.includes(alumno.email));
      }
    });

    test('curso sin profesores: va a EMAIL_USER', async () => {
      assert.equal(await notificarDudaNueva(await duda({ temaId: 'general' })), 1);
      assert.equal(sent[0].to, 'campus@test.es');
      assert.equal(sent[0].subject, 'Nueva duda en Carbono · General');
    });

    test('llamar dos veces: un solo envío', async () => {
      await linkTeacher(course, profe);
      const d = await duda();
      assert.equal(await notificarDudaNueva(d), 1);
      assert.equal(await notificarDudaNueva(d), 0);
      assert.equal(sent.length, 1);
      assert.ok((await Duda.findById(d._id)).notificado.nuevaAt);
    });

    test('<script> en el título sale escapado', async () => {
      await linkTeacher(course, profe);
      await notificarDudaNueva(await duda({ titulo: '<script>alert(1)</script>', texto: '<img src=x onerror=1>' }));
      assert.ok(!sent[0].html.includes('<script>alert'));
      assert.ok(!sent[0].html.includes('<img src=x'));
      assert.ok(sent[0].html.includes('&lt;script&gt;'));
      assert.ok(!/[\r\n]/.test(sent[0].subject));
    });
  });

  describe('respuesta', () => {
    const withAnswer = async (rol, who, extra = {}) => {
      const d = await duda(extra);
      d.respuestas.push({ autorId: who._id, autorNombre: 'Prof. B.', rol, texto: 'Esto es <b>la</b> respuesta' });
      await d.save();
      return d;
    };

    test('respuesta de profesor: un correo al autor', async () => {
      const d = await withAnswer('profesor', profe);
      assert.equal(await notificarRespuesta(d, d.respuestas[0]._id), true);
      assert.equal(sent.length, 1);
      assert.equal(sent[0].to, alumno.email);
      assert.equal(sent[0].subject, 'Prof. B. ha respondido a tu duda');
      assert.ok(sent[0].html.includes('Ver la respuesta'));
      assert.ok(sent[0].html.includes(`https://campus.test/curso/${course._id}/dudas#duda-${d._id}`));
      assert.ok(!sent[0].html.includes('<b>la</b>'));
      assert.equal(await notificarRespuesta(d, d.respuestas[0]._id), false);
      assert.equal(sent.length, 1);
    });

    test('respuesta de alumno: sin correo', async () => {
      const otro = await fx.createUser();
      const d = await withAnswer('alumno', otro);
      assert.equal(await notificarRespuesta(d, d.respuestas[0]._id), false);
      assert.equal(sent.length, 0);
    });

    test('profesor que responde a su propia duda: sin correo', async () => {
      const d = await withAnswer('profesor', profe, { autorId: profe._id });
      assert.equal(await notificarRespuesta(d, d.respuestas[0]._id), false);
      assert.equal(sent.length, 0);
    });

    test('duda retirada: sin correo', async () => {
      const d = await withAnswer('profesor', profe, { retirada: true, autorId: null });
      assert.equal(await notificarRespuesta(d, d.respuestas[0]._id), false);
      assert.equal(sent.length, 0);
    });

    test('ocultar y volver a mostrar la respuesta no reenvía', async () => {
      await linkTeacher(course, profe);
      const d = await duda();
      assert.equal((await respond(d, profe)).status, 201);
      await esperarAvisos();
      assert.equal(sent.filter((m) => m.to === alumno.email).length, 1);
      const rid = (await Duda.findById(d._id)).respuestas[0]._id;
      for (const accion of ['ocultar', 'mostrar']) {
        const r = await api.call('PATCH', `/api/dudas/${d._id}/estado`, { headers: fx.authHeader(profe), body: { accion, respuestaId: String(rid) } });
        assert.equal(r.status, 200);
      }
      await esperarAvisos();
      assert.equal(sent.filter((m) => m.to === alumno.email).length, 1);
      assert.equal(await notificarRespuesta(await Duda.findById(d._id), rid), false);
    });
  });

  test('fallo del transporte no rompe POST /dudas (201)', async () => {
    await linkTeacher(course, profe);
    failMail = true;
    const orig = console.error;
    console.error = () => {};
    try {
      const r = await api.call('POST', `/api/courses/${course._id}/dudas`, {
        headers: fx.authHeader(alumno), body: { temaId, titulo: 'Mi duda', texto: 'Texto de la duda' },
      });
      assert.equal(r.status, 201);
      await esperarAvisos();
    } finally {
      console.error = orig;
    }
    assert.equal(sent.length, 0);
  });

  test('POST /dudas avisa al profesor vinculado', async () => {
    await linkTeacher(course, profe);
    const r = await api.call('POST', `/api/courses/${course._id}/dudas`, {
      headers: fx.authHeader(alumno), body: { temaId, titulo: 'Mi duda', texto: 'Texto de la duda' },
    });
    assert.equal(r.status, 201);
    await esperarAvisos();
    assert.deepEqual(sent.map((m) => m.to), [profe.email]);
  });
});
