// Listado de entregas del panel: validación de parámetros, compatibilidad del endpoint y la agregación real.
// La parte de agregación necesita un MongoDB desechable y se salta sin él:
//   docker run -d --rm --name mongo-test -p 27099:27017 mongo:7
//   MONGO_TEST_URI=mongodb://127.0.0.1:27099/correcciones_test npm test
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'x'.repeat(40);
process.env.NODE_ENV = 'production';

const { default: mongoose } = await import('mongoose');
const { default: express } = await import('express');
const { signToken } = await import('../src/config/jwt.js');
const { default: User } = await import('../src/models/User.js');
const { default: Course } = await import('../src/models/Course.js');
const { default: Ejercicio } = await import('../src/models/Ejercicio.js');
const { default: EntregaEjercicio } = await import('../src/models/EntregaEjercicio.js');
const { buildListadoPipeline, formatListado, parseListado, usaListado } = await import('../src/service/entregasQueryService.js');
const { default: entregaRoutes } = await import('../src/routes/entregaEjercicio.routes.js');

const id = (n) => new mongoose.Types.ObjectId(n.toString(16).padStart(24, '0'));

describe('parseListado', () => {
  test('valores por defecto', () => {
    const f = parseListado({ page: '1' });
    assert.equal(f.orden, 'prioridad');
    assert.equal(f.limit, 20);
    assert.equal(f.q, '');
  });

  test('rechaza estado, curso, orden, página y fechas inválidos', () => {
    for (const q of [{ estado: 'x' }, { curso: 'nope' }, { orden: 'azar' }, { page: '0' }, { page: '1.5' }, { desde: 'ayer' }]) {
      assert.throws(() => parseListado(q), (e) => e.status === 400, JSON.stringify(q));
    }
  });

  test('limita el tamaño de página y la búsqueda', () => {
    assert.equal(parseListado({ limit: '5000' }).limit, 100);
    assert.equal(parseListado({ q: 'a'.repeat(500) }).q.length, 100);
  });

  test('«hasta» con solo el día incluye el día completo', () => {
    const f = parseListado({ hasta: '2026-10-19' });
    assert.equal(f.hasta.toISOString(), '2026-10-19T23:59:59.999Z');
  });

  test('solo los parámetros del listado activan el modo paginado', () => {
    assert.equal(usaListado({}), false);
    assert.equal(usaListado({ foo: '1' }), false);
    assert.equal(usaListado({ q: '' }), true);
  });

  test('la búsqueda escapa los caracteres de expresiones regulares', () => {
    const p = buildListadoPipeline(parseListado({ q: 'a.b(c' }), { users: 'u', ejercicios: 'e', courses: 'c' });
    const match = p.find((s) => s.$match?.$or);
    assert.equal(match.$match.$or[0]['userId.name'].$regex, 'a\\.b\\(c');
  });
});

describe('formatListado', () => {
  test('stats con todos los estados y total; páginas mínimas 1', () => {
    const r = formatListado([{ stats: [{ _id: 'enviado', n: 3 }, { _id: 'aprobado', n: 2 }], total: [], entregas: [] }], { page: 1, limit: 20 });
    assert.deepEqual(r.stats, { enviado: 3, revisado: 0, aprobado: 2, rechazado: 0, total: 5 });
    assert.equal(r.total, 0);
    assert.equal(r.pages, 1);
  });
});

describe('GET /admin/todas (rutas, modelos simulados)', () => {
  let server;
  let base;
  const admin = '64b000000000000000000009';
  const saved = {};
  before(() => {
    saved.findById = User.findById;
    saved.find = EntregaEjercicio.find;
    saved.aggregate = EntregaEjercicio.aggregate;
    User.findById = () => ({ select: async () => ({ _id: admin, role: 'admin', activo: true, esAdmin: () => true, async save() {} }) });
    const q = { populate: () => q, sort: async () => [{ _id: 'e1', estado: 'enviado' }] };
    EntregaEjercicio.find = () => q;
    EntregaEjercicio.aggregate = async (pipeline) => {
      saved.lastPipeline = pipeline;
      return [{ stats: [{ _id: 'enviado', n: 1 }], total: [{ n: 1 }], entregas: [{ _id: 'e1' }] }];
    };
    const app = express();
    app.use(express.json());
    app.use('/api/entregas', entregaRoutes);
    server = app.listen(0);
    base = `http://127.0.0.1:${server.address().port}/api/entregas/admin/todas`;
  });
  after(() => {
    server.close();
    User.findById = saved.findById;
    EntregaEjercicio.find = saved.find;
    EntregaEjercicio.aggregate = saved.aggregate;
  });
  const get = async (qs = '') => {
    const res = await fetch(base + qs, { headers: { Authorization: `Bearer ${signToken({ id: admin, email: 'a@x.com' })}` } });
    return { status: res.status, body: await res.json() };
  };

  test('sin parámetros: misma respuesta que antes, solo { entregas }', async () => {
    const r = await get();
    assert.equal(r.status, 200);
    assert.deepEqual(Object.keys(r.body), ['entregas']);
  });

  test('con parámetros: paginado con total, páginas y stats', async () => {
    const r = await get('?page=1&estado=enviado');
    assert.equal(r.status, 200);
    assert.equal(r.body.total, 1);
    assert.equal(r.body.stats.enviado, 1);
    assert.ok(saved.lastPipeline.length > 0);
  });

  test('parámetro inválido → 400', async () => {
    const r = await get('?orden=azar');
    assert.equal(r.status, 400);
  });
});

const URI = process.env.MONGO_TEST_URI;
describe('agregación real (MongoDB desechable)', { skip: !URI && 'sin MONGO_TEST_URI' }, () => {
  const DAY = 864e5;
  const now = Date.parse('2026-10-19T12:00:00Z');
  const C1 = id(0xc1);
  const C2 = id(0xc2);
  const run = async (query) => {
    const f = parseListado(query);
    const cols = { users: User.collection.name, ejercicios: Ejercicio.collection.name, courses: Course.collection.name };
    return formatListado(await EntregaEjercicio.aggregate(buildListadoPipeline(f, cols)), f);
  };

  before(async () => {
    await mongoose.connect(URI, { dbName: 'test_entregas_listado' }); // una base por archivo: node --test los ejecuta en paralelo
    await mongoose.connection.db.dropDatabase();
    const db = mongoose.connection.db;
    await db.collection(User.collection.name).insertMany([
      { _id: id(1), name: 'Lucía Romero', email: 'lucia@x.es' },
      { _id: id(2), name: 'Pablo Ortega', email: 'pablo@x.es' },
    ]);
    await db.collection(Course.collection.name).insertMany([
      { _id: C1, title: 'ANFORA: Huella Hídrica' },
      { _id: C2, title: 'Modelización de Carbono' },
    ]);
    await db.collection(Ejercicio.collection.name).insertMany([
      { _id: id(0xe1), titulo: 'Cálculo de la huella' },
      { _id: id(0xe2), titulo: 'Modelo RothC' },
    ]);
    const e = (n, user, curso, ej, estado, diasAtras, calificacion) => ({
      _id: id(0x100 + n), userId: user, cursoId: curso, ejercicioId: ej, estado,
      fechaEntrega: new Date(now - diasAtras * DAY), ...(calificacion !== undefined ? { calificacion } : {}),
    });
    await db.collection(EntregaEjercicio.collection.name).insertMany([
      e(1, id(1), C1, id(0xe1), 'enviado', 1),
      e(2, id(2), C1, id(0xe1), 'enviado', 5), // la pendiente más antigua
      e(3, id(1), C2, id(0xe2), 'aprobado', 2, 8),
      e(4, id(2), C2, id(0xe2), 'aprobado', 9, 6),
      e(5, id(99), C1, id(0xe1), 'rechazado', 3, 3), // alumno eliminado
      e(6, id(1), id(0xdead), id(0xbad), 'revisado', 4), // curso y ejercicio eliminados
    ]);
  });
  after(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  });

  test('prioridad: pendientes primero (la más antigua arriba) y luego lo corregido más reciente', async () => {
    const r = await run({ page: '1' });
    assert.deepEqual(r.entregas.map((x) => x._id.toString().slice(-3)), ['102', '101', '103', '105', '106', '104']);
    assert.equal(r.total, 6);
  });

  test('forma de populate: objetos con los campos pedidos o null si se borró', async () => {
    const r = await run({ page: '1' });
    const lucia = r.entregas.find((x) => x._id.equals(id(0x101)));
    assert.deepEqual(Object.keys(lucia.userId).sort(), ['_id', 'email', 'name']);
    assert.equal(lucia.cursoId.title, 'ANFORA: Huella Hídrica');
    assert.equal(r.entregas.find((x) => x._id.equals(id(0x105))).userId, null);
    const huerfana = r.entregas.find((x) => x._id.equals(id(0x106)));
    assert.equal(huerfana.cursoId, null);
    assert.equal(huerfana.ejercicioId, null);
  });

  test('stats ignoran el filtro de estado; total y lista sí lo aplican', async () => {
    const r = await run({ estado: 'aprobado' });
    assert.equal(r.total, 2);
    assert.equal(r.entregas.length, 2);
    assert.deepEqual(r.stats, { enviado: 2, revisado: 1, aprobado: 2, rechazado: 1, total: 6 });
  });

  test('búsqueda por alumno, ejercicio o curso (sin distinguir mayúsculas)', async () => {
    assert.equal((await run({ q: 'pablo' })).total, 2);
    assert.equal((await run({ q: 'rothc' })).total, 2);
    assert.equal((await run({ q: 'anfora' })).total, 3);
    assert.equal((await run({ q: 'anfora' })).stats.total, 3);
  });

  test('filtro por curso y por fechas', async () => {
    assert.equal((await run({ curso: C2.toString() })).total, 2);
    const desde = new Date(now - 3.5 * DAY).toISOString();
    assert.equal((await run({ desde })).total, 3);
  });

  test('orden por nota: con nota primero, de mayor a menor', async () => {
    const r = await run({ orden: 'nota' });
    assert.deepEqual(r.entregas.slice(0, 3).map((x) => x.calificacion), [8, 6, 3]);
  });

  test('paginación', async () => {
    const p2 = await run({ page: '2', limit: '4' });
    assert.equal(p2.entregas.length, 2);
    assert.equal(p2.pages, 2);
    assert.equal(p2.page, 2);
  });
});
