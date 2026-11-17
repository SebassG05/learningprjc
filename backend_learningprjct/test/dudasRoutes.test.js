// Rutas de Dudas: matriz de permisos (seis actores) y comportamiento.
import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'x'.repeat(40);
process.env.CLOUDINARY_CLOUD_NAME = 'demo-cloud';
process.env.CLOUDINARY_API_KEY = '123';
process.env.CLOUDINARY_API_SECRET = 'secreto-de-prueba';

const { startMemoryMongo } = await import('./helpers/memoryMongo.js');
const fx = await import('./helpers/cohortFixtures.js');
const { default: mongoose } = await import('mongoose');
const { default: Course } = await import('../src/models/Course.js');
const { default: User } = await import('../src/models/User.js');
const { default: Duda } = await import('../src/models/Duda.js');
const { default: UserProgress } = await import('../src/models/UserProgress.js');
const { buildDudaRouters, DUDA_RATE_LIMITS } = await import('../src/routes/duda.routes.js');
const { buildProfesorRouter } = await import('../src/routes/profesor.routes.js');
const { removeTeacher } = await import('../src/service/courseTeachers.js');

const HIGH = { preguntas: 10000, respuestas: 10000, ediciones: 10000, reportes: 10000 };

const mount = (limits) => {
  const r = buildDudaRouters({ limits });
  return [
    ['/api/courses/:id/dudas', r.courseRouter],
    ['/api/dudas', r.dudaRouter],
    ['/api/profesor', r.profesorRouter],
    ['/api/admin/dudas', r.adminRouter],
    ['/api/profesor', buildProfesorRouter()],
  ];
};

const makeTeacher = async (course, user) => {
  await Course.updateOne({ _id: course._id }, { $push: { profesores: {
    email: user.email, status: 'active', userId: user._id, tokenHash: 'h', addedBy: user._id,
  } } });
};

describe('rutas de dudas', () => {
  let db; let api;
  let course; let temaId;
  let admin; let alumno; let cerrada; let sinAcceso; let profe; let profeOtro;
  before(async () => {
    db = await startMemoryMongo();
    api = fx.listen(mount(HIGH));
  });
  after(async () => {
    await api.close();
    await db.stop();
  });
  beforeEach(async () => {
    await db.reset();
    admin = await fx.createUser({ role: 'admin' });
    alumno = await fx.createUser();
    cerrada = await fx.createUser();
    sinAcceso = await fx.createUser();
    profe = await fx.createUser();
    profeOtro = await fx.createUser();
    course = await fx.createCourse({ accessMode: 'private' });
    temaId = String(course.temas[0]._id);
    await fx.createCohort(course, { window: 'open', members: [alumno] });
    await fx.createCohort(course, { window: 'ended', members: [cerrada] });
    await makeTeacher(course, profe);
    const otro = await fx.createCourse({ accessMode: 'private', title: 'Otro' });
    await makeTeacher(otro, profeOtro);
  });

  const H = (u) => (u ? fx.authHeader(u) : {});
  const base = () => `/api/courses/${course._id}/dudas`;
  const ask = (u, extra = {}) => api.call('POST', base(), { headers: H(u), body: { temaId, titulo: 'Mi duda', texto: 'Texto de la duda', ...extra } });
  const seed = async (author = alumno, extra = {}) => {
    const d = await Duda.create({
      cursoId: course._id, temaId, autorId: author._id, autorNombre: 'Usuario A.', titulo: 'Semilla', texto: 'Texto', ...extra,
    });
    return d;
  };

  describe('matriz de permisos', () => {
    // [actor, leer, preguntar, responder, resolverAjena, fijar, ocultar]
    const MATRIX = {
      alumno: [200, 201, 201, 403, 403, 403],
      cerrada: [200, 403, 403, 403, 403, 403],
      sinAcceso: [403, 403, 403, 403, 403, 403],
      profe: [200, 201, 201, 200, 200, 200],
      profeOtro: [403, 403, 403, 403, 403, 403],
      admin: [200, 201, 201, 200, 200, 200],
    };
    for (const [name, expected] of Object.entries(MATRIX)) {
      test(`actor ${name}`, async () => {
        const who = { alumno, cerrada, sinAcceso, profe, profeOtro, admin }[name];
        const dueno = await fx.createUser();
        await fx.createCohort(course, { members: [dueno] });
        const ajena = await seed(dueno);
        const [leer, preguntar, responder, resolver, fijar, ocultar] = expected;
        assert.equal((await api.call('GET', base(), { headers: H(who) })).status, leer, 'leer');
        assert.equal((await ask(who)).status, preguntar, 'preguntar');
        assert.equal((await api.call('POST', `/api/dudas/${ajena._id}/respuestas`, { headers: H(who), body: { texto: 'Hola' } })).status, responder, 'responder');
        const est = (accion) => api.call('PATCH', `/api/dudas/${ajena._id}/estado`, { headers: H(who), body: { accion } });
        assert.equal((await est('resolver')).status, resolver, 'resolver ajena');
        assert.equal((await est('fijar')).status, fijar, 'fijar');
        assert.equal((await est('ocultar')).status, ocultar, 'ocultar');
      });
    }

    test('profesor de otro curso con plaza en la cohorte abierta: lee y publica como alumno, 403 al moderar', async () => {
      await fx.createCohort(course, { members: [profeOtro] });
      const d = await seed();
      assert.equal((await api.call('GET', base(), { headers: H(profeOtro) })).status, 200);
      const r = await api.call('POST', `/api/dudas/${d._id}/respuestas`, { headers: H(profeOtro), body: { texto: 'Yo también' } });
      assert.equal(r.status, 201);
      assert.equal(r.body.respuestas.at(-1).rol, 'alumno');
      assert.equal((await api.call('PATCH', `/api/dudas/${d._id}/estado`, { headers: H(profeOtro), body: { accion: 'fijar' } })).status, 403);
    });

    test('sin sesión: 401 en toda escritura y en la lectura de un curso privado', async () => {
      const d = await seed();
      assert.equal((await api.call('GET', base())).status, 401);
      assert.equal((await ask(null)).status, 401);
      assert.equal((await api.call('POST', `/api/dudas/${d._id}/respuestas`, { body: { texto: 'x' } })).status, 401);
      assert.equal((await api.call('PATCH', `/api/dudas/${d._id}`, { body: { titulo: 'x' } })).status, 401);
      assert.equal((await api.call('DELETE', `/api/dudas/${d._id}`)).status, 401);
      assert.equal((await api.call('POST', `/api/dudas/${d._id}/reportar`, { body: {} })).status, 401);
      assert.equal((await api.call('POST', `/api/dudas/${d._id}/vista`)).status, 401);
      assert.equal((await api.call('GET', '/api/profesor/dudas')).status, 401);
      assert.equal((await api.call('GET', '/api/admin/dudas')).status, 401);
    });

    // Antes un anónimo podía leer las dudas de un curso público. Ahora solo los inscritos, los profesores
    // del curso y los admins las leen o escriben: anónimo 401, con sesión sin inscripción 403.
    describe('curso público: solo inscritos, profesores del curso y admins', () => {
      let pub; let inscrito; let profePub; let ajeno; let dudaPub;
      const pubBase = () => `/api/courses/${pub._id}/dudas`;
      const askPub = (u) => api.call('POST', pubBase(), { headers: H(u), body: { temaId: 'general', titulo: 't', texto: 'x' } });
      const reply = (u) => api.call('POST', `/api/dudas/${dudaPub._id}/respuestas`, { headers: H(u), body: { texto: 'Hola' } });
      beforeEach(async () => {
        pub = await fx.createCourse({ accessMode: 'public' });
        inscrito = await fx.createUser();
        profePub = await fx.createUser();
        ajeno = await fx.createUser();
        await UserProgress.create({ userId: inscrito._id, courseId: pub._id });
        await makeTeacher(pub, profePub);
        dudaPub = await Duda.create({ cursoId: pub._id, temaId: 'general', autorId: inscrito._id, autorNombre: 'Ins C.', titulo: 'Semilla', texto: 'Texto' });
      });

      test('anónimo: 401 al listar y al publicar', async () => {
        assert.equal((await api.call('GET', pubBase())).status, 401);
        assert.equal((await askPub(null)).status, 401);
        assert.equal((await reply(null)).status, 401);
      });

      test('con sesión sin inscripción: 403 al listar, preguntar, responder y reportar', async () => {
        const l = await api.call('GET', pubBase(), { headers: H(ajeno) });
        assert.equal(l.status, 403);
        assert.equal(Array.isArray(l.body), false);
        assert.equal(l.text.includes('Semilla'), false);
        assert.equal((await askPub(ajeno)).status, 403);
        assert.equal((await reply(ajeno)).status, 403);
        assert.equal((await api.call('POST', `/api/dudas/${dudaPub._id}/reportar`, { headers: H(ajeno), body: {} })).status, 403);
        assert.equal(await Duda.countDocuments({ cursoId: pub._id }), 1);
      });

      test('inscrito: lista 200, pregunta 201 y responde 201', async () => {
        const l = await api.call('GET', pubBase(), { headers: H(inscrito) });
        assert.equal(l.status, 200);
        assert.deepEqual(l.body.map((d) => d.titulo), ['Semilla']);
        assert.equal((await askPub(inscrito)).status, 201);
        assert.equal((await reply(inscrito)).status, 201);
      });

      test('profesor activo sin inscripción: lista, pregunta, responde como profesor y modera', async () => {
        assert.equal((await api.call('GET', pubBase(), { headers: H(profePub) })).status, 200);
        assert.equal((await askPub(profePub)).status, 201);
        const r = await reply(profePub);
        assert.equal(r.status, 201);
        assert.equal(r.body.respuestas.at(-1).rol, 'profesor');
        assert.equal((await api.call('PATCH', `/api/dudas/${dudaPub._id}/estado`, { headers: H(profePub), body: { accion: 'fijar' } })).status, 200);
      });

      test('admin sin inscripción: lista 200 y pregunta 201', async () => {
        assert.equal((await api.call('GET', pubBase(), { headers: H(admin) })).status, 200);
        assert.equal((await askPub(admin)).status, 201);
      });

      test('profesor de otro curso sin inscripción: 403', async () => {
        assert.equal((await api.call('GET', pubBase(), { headers: H(profeOtro) })).status, 403);
        assert.equal((await reply(profeOtro)).status, 403);
      });
    });

    test('usuario desactivado con JWT válido en curso público: no publica ni modera', async () => {
      const pub = await fx.createCourse({ accessMode: 'public' });
      const baja = await fx.createUser();
      await makeTeacher(pub, baja);
      await User.updateOne({ _id: baja._id }, { $set: { activo: false } });
      const r = await api.call('POST', `/api/courses/${pub._id}/dudas`, { headers: H(baja), body: { temaId: 'general', titulo: 't', texto: 'x' } });
      assert.equal(r.status, 401);
    });

    test('rutas admin: alumno y profesor reciben 403; admin 200', async () => {
      assert.equal((await api.call('GET', '/api/admin/dudas', { headers: H(alumno) })).status, 403);
      assert.equal((await api.call('GET', '/api/admin/dudas', { headers: H(profe) })).status, 403);
      assert.equal((await api.call('GET', '/api/admin/dudas', { headers: H(admin) })).status, 200);
    });

    test('moderar y borrar una duda ajena: alumno 403; borrar ajena sin ser moderador 403', async () => {
      const dueno = await fx.createUser();
      await fx.createCohort(course, { members: [dueno] });
      const d = await seed(dueno);
      assert.equal((await api.call('DELETE', `/api/dudas/${d._id}`, { headers: H(alumno) })).status, 403);
      assert.equal(await Duda.countDocuments({ _id: d._id }), 1);
    });
  });

  describe('comportamiento', () => {
    test('profesor responde: respondida, rol profesor, nombre completo; el autor ve respuestaNoVista', async () => {
      await User.updateOne({ _id: profe._id }, { $set: { name: 'Marta Gil Pérez' } });
      const d = await seed();
      const r = await api.call('POST', `/api/dudas/${d._id}/respuestas`, { headers: H(profe), body: { texto: 'Respuesta' } });
      assert.equal(r.status, 201);
      assert.equal(r.body.estado, 'respondida');
      const resp = r.body.respuestas.at(-1);
      assert.equal(resp.rol, 'profesor');
      assert.equal(resp.autorNombre, 'Marta Gil Pérez');
      assert.equal(JSON.stringify(r.body).includes('notificadoAt'), false);
      const mine = await api.call('GET', base(), { headers: H(alumno) });
      assert.equal(mine.body[0].respuestaNoVista, true);
      assert.equal(JSON.stringify(mine.body).includes(String(alumno._id)), false);
      const v = await api.call('POST', `/api/dudas/${d._id}/vista`, { headers: H(alumno) });
      assert.equal(v.status, 200);
      assert.equal((await Duda.findById(d._id)).respuestaNoVista, false);
      assert.equal((await api.call('POST', `/api/dudas/${d._id}/vista`, { headers: H(profe) })).status, 403);
    });

    test('alumno responde: sigue abierta, «Nombre I.», sin respuestaNoVista', async () => {
      const otro = await fx.createUser();
      await fx.createCohort(course, { members: [otro] });
      await User.updateOne({ _id: otro._id }, { $set: { name: 'Laura Pérez' } });
      const d = await seed();
      const r = await api.call('POST', `/api/dudas/${d._id}/respuestas`, { headers: H(otro), body: { texto: 'Yo creo que sí' } });
      assert.equal(r.status, 201);
      assert.equal(r.body.estado, 'abierta');
      assert.equal(r.body.respuestas.at(-1).autorNombre, 'Laura P.');
      assert.equal((await Duda.findById(d._id)).respuestaNoVista, false);
    });

    test('admin que no es profesor responde con rol equipo', async () => {
      const d = await seed();
      const r = await api.call('POST', `/api/dudas/${d._id}/respuestas`, { headers: H(admin), body: { texto: 'Equipo' } });
      assert.equal(r.body.respuestas.at(-1).rol, 'equipo');
      assert.equal(r.body.estado, 'respondida');
    });

    test('retirar con respuestas: retirada y respuestas visibles; sin respuestas: se borra', async () => {
      const d = await seed();
      await api.call('POST', `/api/dudas/${d._id}/respuestas`, { headers: H(profe), body: { texto: 'R' } });
      const r = await api.call('DELETE', `/api/dudas/${d._id}`, { headers: H(alumno) });
      assert.equal(r.status, 200);
      const raw = await Duda.collection.findOne({ _id: d._id });
      assert.equal(raw.retirada, true);
      assert.equal(raw.autorId, null);
      assert.equal(raw.titulo, null);
      assert.equal(raw.texto, null);
      assert.equal(raw.autorNombre, null);
      const list = await api.call('GET', base(), { headers: H(alumno) });
      assert.equal(list.body[0].retirada, true);
      assert.equal(list.body[0].respuestas.length, 1);
      // retirada: ya no se puede editar
      const sola = await seed();
      assert.equal((await api.call('DELETE', `/api/dudas/${sola._id}`, { headers: H(alumno) })).status, 200);
      assert.equal(await Duda.countDocuments({ _id: sola._id }), 0);
    });

    test('moderador: borra de verdad sin respuestas; con respuestas 409', async () => {
      const a = await seed();
      assert.equal((await api.call('DELETE', `/api/dudas/${a._id}`, { headers: H(profe) })).status, 200);
      assert.equal(await Duda.countDocuments({ _id: a._id }), 0);
      const b = await seed();
      await api.call('POST', `/api/dudas/${b._id}/respuestas`, { headers: H(profe), body: { texto: 'R' } });
      assert.equal((await api.call('DELETE', `/api/dudas/${b._id}`, { headers: H(profe) })).status, 409);
      assert.equal(await Duda.countDocuments({ _id: b._id }), 1);
    });

    test('editar duda y respuesta ajenas → 403; propias → 200 con editadaAt; retirada no se edita', async () => {
      const otro = await fx.createUser();
      await fx.createCohort(course, { members: [otro] });
      const d = await seed();
      assert.equal((await api.call('PATCH', `/api/dudas/${d._id}`, { headers: H(otro), body: { titulo: 'Hack' } })).status, 403);
      assert.equal((await api.call('PATCH', `/api/dudas/${d._id}`, { headers: H(profe), body: { titulo: 'Hack' } })).status, 403);
      const ok = await api.call('PATCH', `/api/dudas/${d._id}`, { headers: H(alumno), body: { titulo: 'Nuevo título' } });
      assert.equal(ok.status, 200);
      assert.equal(ok.body.titulo, 'Nuevo título');
      assert.equal((await api.call('PATCH', `/api/dudas/${d._id}`, { headers: H(alumno), body: { titulo: '   ' } })).status, 400);

      const r = await api.call('POST', `/api/dudas/${d._id}/respuestas`, { headers: H(otro), body: { texto: 'Mía' } });
      const rid = r.body.respuestas.at(-1)._id;
      const rurl = `/api/dudas/${d._id}/respuestas/${rid}`;
      assert.equal((await api.call('PATCH', rurl, { headers: H(alumno), body: { texto: 'x' } })).status, 403);
      assert.equal((await api.call('DELETE', rurl, { headers: H(profe) })).status, 403);
      const e = await api.call('PATCH', rurl, { headers: H(otro), body: { texto: 'Editada' } });
      assert.equal(e.status, 200);
      assert.ok(e.body.respuestas.at(-1).editadaAt);
      assert.equal((await api.call('DELETE', rurl, { headers: H(otro) })).status, 200);
      assert.equal((await Duda.findById(d._id)).respuestas.length, 0);

      await api.call('POST', `/api/dudas/${d._id}/respuestas`, { headers: H(profe), body: { texto: 'P' } });
      await api.call('DELETE', `/api/dudas/${d._id}`, { headers: H(alumno) });
      assert.equal((await api.call('PATCH', `/api/dudas/${d._id}`, { headers: H(alumno), body: { titulo: 'x' } })).status, 403);
    });

    test('borrar la respuesta docente recalcula el estado', async () => {
      const d = await seed();
      const r = await api.call('POST', `/api/dudas/${d._id}/respuestas`, { headers: H(profe), body: { texto: 'P' } });
      const rid = r.body.respuestas.at(-1)._id;
      const del = await api.call('DELETE', `/api/dudas/${d._id}/respuestas/${rid}`, { headers: H(profe) });
      assert.equal(del.status, 200);
      assert.equal(del.body.estado, 'abierta');
    });

    test('segundo reporte del mismo usuario → 409; reportesCount y motivos solo para moderadores', async () => {
      const d = await seed();
      const url = `/api/dudas/${d._id}/reportar`;
      assert.equal((await api.call('POST', url, { headers: H(alumno), body: { motivo: 'spam' } })).status, 201);
      assert.equal((await api.call('POST', url, { headers: H(alumno), body: { motivo: 'otra vez' } })).status, 409);
      assert.equal((await api.call('POST', url, { headers: H(cerrada), body: {} })).status, 201);
      assert.equal((await api.call('POST', url, { headers: H(sinAcceso), body: {} })).status, 403);
      const mod = await api.call('GET', base(), { headers: H(profe) });
      assert.equal(mod.body[0].reportesCount, 2);
      assert.deepEqual(mod.body[0].reportes.map((r) => r.motivo), ['spam', '']);
      assert.ok(mod.body[0].reportes.every((r) => r.at && !('userId' in r)));
      assert.equal(mod.text.includes(String(alumno._id)), false);
      assert.equal(mod.text.includes(String(cerrada._id)), false);
      const al = await api.call('GET', base(), { headers: H(alumno) });
      assert.equal(al.body[0].reportesCount, undefined);
      assert.equal(al.body[0].reportes, undefined);
      assert.equal(al.text.includes('spam'), false);
    });

    test('alumno no ve dudas ocultas; profesor sí; mostrar la recupera', async () => {
      const d = await seed();
      assert.equal((await api.call('PATCH', `/api/dudas/${d._id}/estado`, { headers: H(profe), body: { accion: 'ocultar' } })).status, 200);
      assert.equal((await api.call('GET', base(), { headers: H(alumno) })).body.length, 0);
      assert.equal((await api.call('GET', base(), { headers: H(profe) })).body.length, 1);
      assert.equal((await api.call('POST', `/api/dudas/${d._id}/respuestas`, { headers: H(alumno), body: { texto: 'x' } })).status, 404);
      await api.call('PATCH', `/api/dudas/${d._id}/estado`, { headers: H(profe), body: { accion: 'mostrar' } });
      assert.equal((await api.call('GET', base(), { headers: H(alumno) })).body.length, 1);
    });

    test('ocultar una respuesta: el alumno no la ve y el estado se recalcula', async () => {
      const d = await seed();
      const r = await api.call('POST', `/api/dudas/${d._id}/respuestas`, { headers: H(profe), body: { texto: 'P' } });
      const respuestaId = r.body.respuestas.at(-1)._id;
      const h = await api.call('PATCH', `/api/dudas/${d._id}/estado`, { headers: H(profe), body: { accion: 'ocultar', respuestaId } });
      assert.equal(h.status, 200);
      assert.equal(h.body.estado, 'abierta');
      assert.equal((await api.call('GET', base(), { headers: H(alumno) })).body[0].respuestas.length, 0);
      assert.equal((await api.call('GET', base(), { headers: H(profe) })).body[0].respuestas.length, 1);
      assert.equal((await api.call('PATCH', `/api/dudas/${d._id}/estado`, { headers: H(alumno), body: { accion: 'ocultar', respuestaId } })).status, 403);
      const s = await api.call('PATCH', `/api/dudas/${d._id}/estado`, { headers: H(profe), body: { accion: 'mostrar', respuestaId } });
      assert.equal(s.body.estado, 'respondida');
    });

    test('resolver / reabrir: el autor puede, otro alumno no', async () => {
      const d = await seed();
      const est = (u, accion) => api.call('PATCH', `/api/dudas/${d._id}/estado`, { headers: H(u), body: { accion } });
      assert.equal((await est(alumno, 'resolver')).body.estado, 'resuelta');
      assert.equal((await est(alumno, 'reabrir')).body.estado, 'abierta');
      const otro = await fx.createUser();
      await fx.createCohort(course, { members: [otro] });
      assert.equal((await est(otro, 'resolver')).status, 403);
      assert.equal((await est(otro, 'reabrir')).status, 403);
      assert.equal((await est(profe, 'fijar')).body.fijada, true);
      assert.equal((await est(profe, 'desfijar')).body.fijada, false);
      assert.equal((await api.call('PATCH', `/api/dudas/${d._id}/estado`, { headers: H(profe), body: { accion: 'explotar' } })).status, 400);
    });

    test('profesor quitado (removeTeacher) no puede moderar en la siguiente petición', async () => {
      const d = await seed();
      const url = `/api/dudas/${d._id}/estado`;
      assert.equal((await api.call('PATCH', url, { headers: H(profe), body: { accion: 'fijar' } })).status, 200);
      const row = (await Course.findById(course._id).select('profesores')).profesores.find((p) => String(p.userId) === String(profe._id));
      await removeTeacher({ courseId: course._id, teacherId: row._id });
      assert.equal((await api.call('PATCH', url, { headers: H(profe), body: { accion: 'desfijar' } })).status, 403);
    });

    test('validación: temaId inexistente, título largo o vacío, texto vacío → 400', async () => {
      const bad = async (extra) => {
        const r = await ask(alumno, extra);
        assert.equal(r.status, 400);
        assert.ok(r.body.error);
        assert.ok(r.body.errors);
      };
      await bad({ temaId: String(new mongoose.Types.ObjectId()) });
      await bad({ titulo: 'a'.repeat(121) });
      await bad({ titulo: '   ' });
      await bad({ texto: '' });
      await bad({ texto: 'a'.repeat(2001) });
      await bad({ lang: 'fr' });
      assert.equal((await ask(alumno, { temaId: 'general' })).status, 201);
      assert.equal((await ask(alumno, { titulo: 'a'.repeat(120) })).status, 201);
      assert.equal((await api.call('GET', `${base()}?temaId=${new mongoose.Types.ObjectId()}`, { headers: H(alumno) })).status, 400);
      assert.equal((await api.call('GET', `${base()}?estado=rara`, { headers: H(alumno) })).status, 400);
    });

    test('el curso sale de la URL: un cursoId en el body no lo cambia', async () => {
      const otro = await fx.createCourse({ accessMode: 'public', title: 'Otro curso' });
      const r = await ask(alumno, { cursoId: String(otro._id), autorId: String(admin._id) });
      assert.equal(r.status, 201);
      const saved = await Duda.findById(r.body._id);
      assert.equal(String(saved.cursoId), String(course._id));
      assert.equal(String(saved.autorId), String(alumno._id));
      assert.equal(r.body.autorId, undefined);
    });

    test('lista: fijadas primero, luego última actividad; filtros por tema y estado', async () => {
      const a = await seed(alumno, { titulo: 'A', ultimaActividad: new Date(Date.now() - 3000) });
      const b = await seed(alumno, { titulo: 'B', ultimaActividad: new Date(Date.now() - 1000) });
      const c = await seed(alumno, { titulo: 'C', ultimaActividad: new Date(Date.now() - 5000), fijada: true, temaId: 'general' });
      const l = await api.call('GET', base(), { headers: H(alumno) });
      assert.deepEqual(l.body.map((x) => x.titulo), ['C', 'B', 'A']);
      assert.match(l.headers.get('cache-control'), /private, no-store/);
      assert.equal((await api.call('GET', `${base()}?temaId=general`, { headers: H(alumno) })).body.length, 1);
      await Duda.updateOne({ _id: a._id }, { estado: 'resuelta' });
      assert.equal((await api.call('GET', `${base()}?estado=resuelta`, { headers: H(alumno) })).body.length, 1);
      assert.ok(b);
    });

    test('ultimaActividad solo se mueve con contenido nuevo: no con vista, reportar, fijar, ocultar', async () => {
      const antes = new Date(Date.now() - 60000);
      const d = await seed(alumno, { ultimaActividad: antes });
      await api.call('POST', `/api/dudas/${d._id}/respuestas`, { headers: H(profe), body: { texto: 'P' } });
      assert.ok((await Duda.findById(d._id)).ultimaActividad > antes);
      await Duda.updateOne({ _id: d._id }, { ultimaActividad: antes });
      await api.call('POST', `/api/dudas/${d._id}/vista`, { headers: H(alumno) });
      await api.call('POST', `/api/dudas/${d._id}/reportar`, { headers: H(cerrada), body: {} });
      for (const accion of ['fijar', 'desfijar', 'ocultar', 'mostrar']) {
        await api.call('PATCH', `/api/dudas/${d._id}/estado`, { headers: H(profe), body: { accion } });
      }
      assert.equal((await Duda.findById(d._id)).ultimaActividad.getTime(), antes.getTime());
      await api.call('PATCH', `/api/dudas/${d._id}/estado`, { headers: H(alumno), body: { accion: 'resolver' } });
      assert.ok((await Duda.findById(d._id)).ultimaActividad > antes);
    });

    test('el autor retira su duda oculta; el resto de acciones sobre una oculta siguen en 404', async () => {
      const d = await seed(alumno, { oculta: true });
      assert.equal((await api.call('PATCH', `/api/dudas/${d._id}`, { headers: H(alumno), body: { titulo: 'x' } })).status, 404);
      assert.equal((await api.call('POST', `/api/dudas/${d._id}/reportar`, { headers: H(alumno), body: {} })).status, 404);
      assert.equal((await api.call('DELETE', `/api/dudas/${d._id}`, { headers: H(alumno) })).status, 200);
      assert.equal(await Duda.countDocuments({ _id: d._id }), 0);
      const otro = await fx.createUser();
      await fx.createCohort(course, { members: [otro] });
      const e = await seed(alumno, { oculta: true });
      assert.equal((await api.call('DELETE', `/api/dudas/${e._id}`, { headers: H(otro) })).status, 404);
    });

    test('borrado atómico: con una respuesta no se borra (autor retira, moderador 409)', async () => {
      const d = await seed(alumno, { respuestas: [{ autorId: profe._id, autorNombre: 'M', rol: 'profesor', texto: 'R' }] });
      assert.equal((await api.call('DELETE', `/api/dudas/${d._id}`, { headers: H(profe) })).status, 409);
      const r = await api.call('DELETE', `/api/dudas/${d._id}`, { headers: H(alumno) });
      assert.equal(r.status, 200);
      assert.equal(r.body.retirada, true);
      assert.equal(await Duda.countDocuments({ _id: d._id }), 1);
    });

    test('reabrir exige poder publicar; resolver la propia vale en solo lectura', async () => {
      const d = await seed(cerrada);
      const est = (accion) => api.call('PATCH', `/api/dudas/${d._id}/estado`, { headers: H(cerrada), body: { accion } });
      assert.equal((await est('resolver')).status, 200);
      assert.equal((await est('reabrir')).status, 403);
      assert.equal((await Duda.findById(d._id)).estado, 'resuelta');
      const e = await seed(alumno, { estado: 'resuelta' });
      const r = await api.call('PATCH', `/api/dudas/${e._id}/estado`, { headers: H(alumno), body: { accion: 'reabrir' } });
      assert.equal(r.body.estado, 'abierta');
    });

    test('límites por usuario: cupo propio aunque comparta IP; x-forwarded-for no lo reinicia', async () => {
      const real = fx.listen(mount({ preguntas: 10 }));
      try {
        const post = (u, ip) => real.call('POST', base(), { headers: { ...H(u), 'x-forwarded-for': ip }, body: { temaId: 'general', titulo: 't', texto: 'x' } });
        for (let i = 0; i < 10; i += 1) assert.equal((await post(alumno, `1.1.1.${i}`)).status, 201);
        assert.equal((await post(alumno, '9.9.9.9')).status, 429);
        assert.equal((await post(admin, '1.1.1.0')).status, 201);
      } finally {
        await real.close();
      }
    });

    test('un moderador hace más de 30 acciones de moderación sin 429; un alumno sí se limita', async () => {
      const real = fx.listen(mount({ ediciones: 30 }));
      try {
        const d = await seed();
        for (let i = 0; i < 35; i += 1) {
          const r = await real.call('PATCH', `/api/dudas/${d._id}/estado`, { headers: H(profe), body: { accion: i % 2 ? 'desfijar' : 'fijar' } });
          assert.equal(r.status, 200);
        }
        let last;
        for (let i = 0; i < 31; i += 1) last = await real.call('PATCH', `/api/dudas/${d._id}/estado`, { headers: H(alumno), body: { accion: 'resolver' } });
        assert.equal(last.status, 429);
      } finally {
        await real.close();
      }
    });

    test('«solo lectura» no publica ni responde ni edita lo suyo', async () => {
      const d = await seed(cerrada);
      assert.equal((await api.call('POST', `/api/dudas/${d._id}/respuestas`, { headers: H(cerrada), body: { texto: 'x' } })).status, 403);
      assert.equal((await api.call('PATCH', `/api/dudas/${d._id}`, { headers: H(cerrada), body: { titulo: 'x' } })).status, 403);
    });

    test('GET /api/profesor/dudas: abiertas o reportadas de sus cursos, con curso; contadores en /cursos', async () => {
      await seed(alumno, { titulo: 'abierta' });
      await seed(alumno, { titulo: 'resuelta y reportada', estado: 'resuelta', reportes: [{ userId: alumno._id, motivo: 'm' }] });
      await seed(alumno, { titulo: 'resuelta', estado: 'resuelta' });
      await seed(alumno, { titulo: 'oculta abierta', oculta: true });
      const r = await api.call('GET', '/api/profesor/dudas', { headers: H(profe) });
      assert.equal(r.status, 200);
      assert.deepEqual(r.body.map((x) => x.titulo).sort(), ['abierta', 'oculta abierta', 'resuelta y reportada']);
      assert.equal(String(r.body[0].curso._id), String(course._id));
      assert.equal(r.body[0].curso.title, 'Curso');
      assert.equal(r.text.includes(String(alumno._id)), false);
      assert.equal((await api.call('GET', '/api/profesor/dudas', { headers: H(profeOtro) })).body.length, 0);
      const cursos = await api.call('GET', '/api/profesor/cursos', { headers: H(profe) });
      assert.equal(cursos.body[0].abiertas, 1);
      assert.equal(cursos.body[0].reportadas, 1);
    });

    test('GET /api/admin/dudas: filtros, paginación y curso', async () => {
      for (let i = 0; i < 3; i += 1) await seed(alumno, { titulo: `d${i}` });
      await seed(alumno, { titulo: 'rep', estado: 'resuelta', reportes: [{ userId: alumno._id, motivo: 'm' }] });
      const all = await api.call('GET', '/api/admin/dudas?limit=2&page=2', { headers: H(admin) });
      assert.equal(all.status, 200);
      assert.equal(all.body.total, 4);
      assert.equal(all.body.items.length, 2);
      assert.equal(all.body.page, 2);
      assert.equal(all.body.limit, 2);
      assert.equal(all.body.items[0].curso.title, 'Curso');
      assert.equal((await api.call('GET', '/api/admin/dudas?reportadas=1', { headers: H(admin) })).body.total, 1);
      assert.equal((await api.call('GET', '/api/admin/dudas?estado=resuelta', { headers: H(admin) })).body.total, 1);
      assert.equal((await api.call('GET', `/api/admin/dudas?curso=${new mongoose.Types.ObjectId()}`, { headers: H(admin) })).body.total, 0);
      assert.equal((await api.call('GET', '/api/admin/dudas?limit=500', { headers: H(admin) })).body.limit, 50);
    });
  });

  test('límites reales: la 11.ª pregunta en una hora → 429', async () => {
    assert.deepEqual(DUDA_RATE_LIMITS, { preguntas: 10, respuestas: 30, ediciones: 30, reportes: 10 });
    const real = fx.listen(mount(undefined));
    try {
      for (let i = 0; i < 10; i += 1) {
        const r = await real.call('POST', base(), { headers: H(alumno), body: { temaId: 'general', titulo: `t${i}`, texto: 'x' } });
        assert.equal(r.status, 201);
      }
      const r = await real.call('POST', base(), { headers: H(alumno), body: { temaId: 'general', titulo: 'once', texto: 'x' } });
      assert.equal(r.status, 429);
    } finally {
      await real.close();
    }
  });
});
