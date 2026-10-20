// Panel de correcciones: reglas de corrección (intentos, nota null, aviso sin duplicados) y permisos.
// Modelos y correo simulados: sin base de datos ni red externa. Ejecutar: npm test
import { test, before, after, beforeEach, describe } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'x'.repeat(40);
process.env.NODE_ENV = 'production';

// El transporte de correo se crea al importar mailService: se sustituye antes
const sent = [];
const { default: nodemailer } = await import('nodemailer');
nodemailer.createTransport = () => ({ sendMail: async (opts) => { sent.push(opts); } });

const { default: express } = await import('express');
const { signToken } = await import('../src/config/jwt.js');
const { default: User } = await import('../src/models/User.js');
const { default: UserProgress } = await import('../src/models/UserProgress.js');
const { default: EntregaEjercicio } = await import('../src/models/EntregaEjercicio.js');
const { aplicarCorreccion, debeNotificar, marcarNotificado, etiquetaEstado } = await import('../src/service/correccionService.js');
const { default: entregaRoutes } = await import('../src/routes/entregaEjercicio.routes.js');
const { default: userRoutes } = await import('../src/routes/user.routes.js');

const ADMIN = '64b000000000000000000009';
const ANA = '64b000000000000000000001';
const ENTREGA = '64e000000000000000000001';
const CURSO = '64d000000000000000000001';

const accounts = {
  [ADMIN]: { role: 'admin', name: 'Admin', email: 'admin@x.com' },
  [ANA]: { role: 'usuario', name: 'Ana', email: 'ana@x.com' },
};
User.findById = (id) => ({
  select: async () =>
    accounts[id] && { _id: id, ...accounts[id], activo: true, esAdmin() { return ['admin', 'superadmin'].includes(this.role); }, async save() {} },
});

let entrega;
let populateCalls;
// Consulta encadenable: con populate devuelve un objeto plano con el alumno incluido (como Mongoose)
const chain = (value) => {
  let populated = false;
  const q = {
    populate: (path, fields) => { populated = true; populateCalls.push([path, fields]); return q; },
    sort: () => q,
    then: (ok, ko) => Promise.resolve(value(populated)).then(ok, ko),
  };
  return q;
};
EntregaEjercicio.findById = () =>
  chain((populated) => (populated && entrega ? { ...entrega.toObject(), userId: { _id: ANA, name: 'Ana', email: 'ana@x.com' } } : entrega));
EntregaEjercicio.find = () => chain(() => [entrega]);
EntregaEjercicio.prototype.save = async function () { return this; };
// Resumen de entregas por alumno (pestaña Progreso): sin entregas en este curso
EntregaEjercicio.aggregate = async () => [];
const { default: Ejercicio } = await import('../src/models/Ejercicio.js');
Ejercicio.countDocuments = async () => 0;
UserProgress.find = () => chain(() => [
  { userId: { _id: ANA, name: 'Ana', email: 'ana@x.com' }, enrolledAt: new Date(), progress: 40, status: 'enrolled', completedTests: [] },
]);

const nueva = (extra = {}) =>
  new EntregaEjercicio({ _id: ENTREGA, ejercicioId: '64f000000000000000000001', userId: ANA, cursoId: CURSO, estado: 'enviado', ...extra });

let server;
let base;
before(() => {
  const app = express();
  app.use(express.json());
  app.use('/api/entregas', entregaRoutes);
  app.use('/api/users', userRoutes);
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}/api`;
});
after(() => server.close());
beforeEach(() => {
  sent.length = 0;
  populateCalls = [];
  entrega = nueva();
});

const call = async (method, path, who, body) => {
  const headers = { 'Content-Type': 'application/json' };
  if (who) headers.Authorization = `Bearer ${signToken({ id: who, email: accounts[who].email })}`;
  const res = await fetch(base + path, { method, headers, body: body && JSON.stringify(body) });
  return { status: res.status, body: await res.json().catch(() => ({})) };
};

describe('aplicarCorreccion', () => {
  test('rechazar suma un intento solo al entrar en «rechazado»', () => {
    const e = nueva();
    aplicarCorreccion(e, { estado: 'rechazado', calificacion: 3 });
    assert.equal(e.intentos, 1);
    // Editar la nota de una entrega ya rechazada no es un rechazo nuevo
    aplicarCorreccion(e, { estado: 'rechazado', calificacion: 4 });
    assert.equal(e.intentos, 1);
    assert.equal(e.bloqueado, false);
  });

  test('el segundo rechazo real (tras reentregar) bloquea la entrega', () => {
    const e = nueva({ estado: 'enviado', intentos: 1 });
    aplicarCorreccion(e, { estado: 'rechazado' });
    assert.equal(e.intentos, 2);
    assert.equal(e.bloqueado, true);
  });

  test('null o cadena vacía borran la nota; undefined la conserva', () => {
    const e = nueva({ calificacion: 7 });
    aplicarCorreccion(e, { feedbackProfesor: 'ok' });
    assert.equal(e.calificacion, 7);
    aplicarCorreccion(e, { calificacion: null });
    assert.equal(e.calificacion, undefined);
    e.calificacion = 6;
    aplicarCorreccion(e, { calificacion: '' });
    assert.equal(e.calificacion, undefined);
  });

  test('rechaza notas fuera de 0–10, no numéricas y estados desconocidos', () => {
    for (const calificacion of [-1, 10.5, 'abc', Infinity]) {
      assert.throws(() => aplicarCorreccion(nueva(), { calificacion }), /entre 0 y 10/);
    }
    assert.throws(() => aplicarCorreccion(nueva(), { estado: 'archivado' }), /Estado no válido/);
  });

  test('acepta la nota como texto numérico', () => {
    const e = nueva();
    aplicarCorreccion(e, { calificacion: '8.5' });
    assert.equal(e.calificacion, 8.5);
  });
});

describe('debeNotificar', () => {
  test('avisa la primera vez y solo cuando cambian el estado o la nota', () => {
    const e = nueva({ estado: 'aprobado', calificacion: 8 });
    assert.equal(debeNotificar(e), true);
    marcarNotificado(e);
    assert.equal(debeNotificar(e), false);
    e.feedbackProfesor = 'Otro comentario';
    assert.equal(debeNotificar(e), false);
    e.calificacion = 9;
    assert.equal(debeNotificar(e), true);
    marcarNotificado(e);
    e.estado = 'revisado';
    assert.equal(debeNotificar(e), true);
  });

  test('nunca avisa de «enviado»', () => {
    assert.equal(debeNotificar(nueva()), false);
  });

  test('«revisado» se comunica como «Requiere cambios»', () => {
    assert.equal(etiquetaEstado('revisado'), 'Requiere cambios');
  });
});

describe('PUT /entregas/:id/corregir', () => {
  test('dos guardados iguales envían un solo email', async () => {
    const r1 = await call('PUT', `/entregas/${ENTREGA}/corregir`, ADMIN, { estado: 'aprobado', calificacion: 8 });
    assert.equal(r1.status, 200);
    const r2 = await call('PUT', `/entregas/${ENTREGA}/corregir`, ADMIN, { estado: 'aprobado', calificacion: 8, feedbackProfesor: 'ajuste' });
    assert.equal(r2.status, 200);
    assert.equal(sent.length, 1);
    assert.match(sent[0].subject, /corregido/);
  });

  test('cambiar la nota vuelve a avisar y el email dice «Requiere cambios»', async () => {
    await call('PUT', `/entregas/${ENTREGA}/corregir`, ADMIN, { estado: 'revisado', calificacion: 4 });
    await call('PUT', `/entregas/${ENTREGA}/corregir`, ADMIN, { estado: 'revisado', calificacion: 4.5 });
    assert.equal(sent.length, 2);
    assert.match(sent[1].html, /Requiere cambios/);
  });

  test('nota null borra la calificación', async () => {
    entrega = nueva({ estado: 'aprobado', calificacion: 6 });
    const r = await call('PUT', `/entregas/${ENTREGA}/corregir`, ADMIN, { calificacion: null });
    assert.equal(r.status, 200);
    assert.equal(r.body.entrega.calificacion, undefined);
  });

  test('nota inválida → 400 sin guardar ni avisar', async () => {
    const r = await call('PUT', `/entregas/${ENTREGA}/corregir`, ADMIN, { calificacion: 11, estado: 'aprobado' });
    assert.equal(r.status, 400);
    assert.equal(sent.length, 0);
  });

  test('un alumno no puede corregir', async () => {
    const r = await call('PUT', `/entregas/${ENTREGA}/corregir`, ANA, { estado: 'aprobado' });
    assert.equal(r.status, 403);
  });
});

describe('GET /entregas/admin/todas', () => {
  test('trae el título real del curso (Course usa «title»)', async () => {
    const r = await call('GET', '/entregas/admin/todas', ADMIN);
    assert.equal(r.status, 200);
    assert.deepEqual(Object.keys(r.body), ['entregas']);
    assert.ok(populateCalls.some(([p, f]) => p === 'cursoId' && f === 'title titleEn'));
  });
});

describe('GET /users/admin/courses/:id/enrollments', () => {
  test('solo admin: un alumno recibe 403', async () => {
    const r = await call('GET', `/users/admin/courses/${CURSO}/enrollments`, ANA);
    assert.equal(r.status, 403);
  });

  test('sin token → 401', async () => {
    const r = await call('GET', `/users/admin/courses/${CURSO}/enrollments`);
    assert.equal(r.status, 401);
  });

  test('admin recibe la lista con el mismo formato', async () => {
    const r = await call('GET', `/users/admin/courses/${CURSO}/enrollments`, ADMIN);
    assert.equal(r.status, 200);
    assert.equal(r.body.total, 1);
    assert.equal(r.body.enrollments[0].name, 'Ana');
  });
});
