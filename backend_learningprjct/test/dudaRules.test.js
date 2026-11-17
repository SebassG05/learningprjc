// Reglas puras de las dudas (firma, rol, estado, retirada, vista pública) y la retirada real en Mongo.
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';

process.env.JWT_SECRET = 'x'.repeat(40);

const { startMemoryMongo } = await import('./helpers/memoryMongo.js');
const { default: Duda, DUDA_LIMITS } = await import('../src/models/Duda.js');
const { nombrePublico, rolDe, recalcularEstado, retirarDuda, toPublic } = await import('../src/service/dudaRules.js');

const oid = () => new mongoose.Types.ObjectId();

describe('nombrePublico', () => {
  test('alumno: primer nombre + inicial de la última palabra', () => {
    assert.equal(nombrePublico('Laura Martín Pérez', 'alumno'), 'Laura P.');
    assert.equal(nombrePublico('  Laura   Pérez ', 'alumno'), 'Laura P.');
  });
  test('un solo nombre queda tal cual', () => assert.equal(nombrePublico('Laura', 'alumno'), 'Laura'));
  test('vacío, en blanco o null → Alumno', () => {
    assert.equal(nombrePublico('', 'alumno'), 'Alumno');
    assert.equal(nombrePublico('   ', 'alumno'), 'Alumno');
    assert.equal(nombrePublico(null, 'alumno'), 'Alumno');
  });
  test('profesor y equipo: nombre completo recortado', () => {
    assert.equal(nombrePublico('  Marta Gil Ruiz ', 'profesor'), 'Marta Gil Ruiz');
    assert.equal(nombrePublico('', 'profesor'), 'Profesor');
    assert.equal(nombrePublico(' ', 'equipo'), 'Equipo docente');
  });
});

describe('rolDe', () => {
  test('profesor, admin-profesor, admin y alumno', () => {
    assert.equal(rolDe({ access: { teacher: true }, viewer: { id: '1', role: 'usuario' } }), 'profesor');
    assert.equal(rolDe({ access: { teacher: true }, viewer: { id: '1', role: 'admin' } }), 'profesor');
    assert.equal(rolDe({ access: { teacher: false }, viewer: { id: '1', role: 'admin' } }), 'equipo');
    assert.equal(rolDe({ access: { teacher: false }, viewer: { id: '1', role: 'superadmin' } }), 'equipo');
    assert.equal(rolDe({ access: { teacher: false }, viewer: { id: '1', role: 'usuario' } }), 'alumno');
  });
});

describe('recalcularEstado', () => {
  const r = (rol, oculta = false) => ({ rol, oculta });
  test('sin respuestas o solo alumnos → abierta', () => {
    assert.equal(recalcularEstado({ estado: 'abierta', respuestas: [] }), 'abierta');
    assert.equal(recalcularEstado({ estado: 'respondida', respuestas: [r('alumno')] }), 'abierta');
  });
  test('profesor o equipo visible → respondida', () => {
    assert.equal(recalcularEstado({ estado: 'abierta', respuestas: [r('alumno'), r('profesor')] }), 'respondida');
    assert.equal(recalcularEstado({ estado: 'abierta', respuestas: [r('equipo')] }), 'respondida');
  });
  test('profesor oculta → abierta', () => {
    assert.equal(recalcularEstado({ estado: 'respondida', respuestas: [r('profesor', true)] }), 'abierta');
  });
  test('resuelta se mantiene', () => {
    assert.equal(recalcularEstado({ estado: 'resuelta', respuestas: [] }), 'resuelta');
  });
});

describe('retirarDuda', () => {
  let db;
  before(async () => { db = await startMemoryMongo(); });
  after(async () => { await db.stop(); });

  const base = () => ({
    cursoId: oid(), temaId: 'general', autorId: oid(), autorNombre: 'Laura P.',
    titulo: 'Una duda', texto: 'Contenido de la duda',
  });

  test('sin respuestas → borrar', () => {
    assert.equal(retirarDuda({ ...base(), respuestas: [] }), 'borrar');
  });

  test('con respuestas: se guarda y en Mongo no queda ni titulo, ni texto, ni autor', async () => {
    const duda = await Duda.create({
      ...base(),
      respuestas: [{ autorId: oid(), autorNombre: 'Marta Gil', rol: 'profesor', texto: 'Respuesta' }],
    });
    assert.equal(retirarDuda(duda), 'retirada');
    await duda.save();
    const raw = await Duda.collection.findOne({ _id: duda._id });
    assert.equal(raw.retirada, true);
    assert.equal(raw.titulo, null);
    assert.equal(raw.texto, null);
    assert.equal(raw.autorNombre, null);
    assert.equal(raw.autorId, null);
    assert.equal(raw.respuestas.length, 1);
  });

  test('límites exportados', () => {
    assert.deepEqual(DUDA_LIMITS, { titulo: 120, texto: 2000, respuesta: 2000, motivo: 300 });
  });
});

describe('toPublic', () => {
  const autor = oid();
  const otro = oid();
  const duda = () => ({
    _id: oid(), cursoId: oid(), temaId: 'general', autorId: autor, autorNombre: 'Laura P.',
    titulo: 't', texto: 'x', estado: 'respondida', oculta: false, retirada: false,
    reportes: [{ userId: otro, motivo: 'm', at: new Date() }],
    respuestas: [
      { _id: oid(), autorId: autor, autorNombre: 'Laura P.', rol: 'alumno', texto: 'a', oculta: false },
      { _id: oid(), autorId: otro, autorNombre: 'Marta', rol: 'profesor', texto: 'b', oculta: true },
    ],
  });

  test('alumno: sin autorId, reportes ni respuestas ocultas; marca lo suyo', () => {
    const p = toPublic(duda(), { viewerId: String(autor), moderador: false });
    assert.equal(p.autorId, undefined);
    assert.equal(p.reportes, undefined);
    assert.equal(p.reportesCount, undefined);
    assert.equal(p.mine, true);
    assert.equal(p.puedeModerar, false);
    assert.equal(p.respuestas.length, 1);
    assert.equal(p.respuestas[0].autorId, undefined);
    assert.equal(p.respuestas[0].mine, true);
    assert.equal(JSON.stringify(p).includes(String(autor)), false);
    assert.equal(JSON.stringify(p).includes(String(otro)), false);
  });

  test('moderador: ve respuestas ocultas marcadas, reportesCount y los motivos sin quién reporta', () => {
    const d = duda();
    const p = toPublic(d, { viewerId: String(oid()), moderador: true });
    assert.equal(p.respuestas.length, 2);
    assert.equal(p.respuestas[1].oculta, true);
    assert.deepEqual(p.reportes, [{ motivo: 'm', at: d.reportes[0].at }]);
    assert.equal(p.reportesCount, 1);
    assert.equal(JSON.stringify(p.reportes).includes(String(otro)), false);
    assert.equal(p.mine, false);
    assert.equal(p.puedeModerar, true);
    assert.equal(p.autorId, undefined);
  });

  test('no expone notificado ni notificadoAt; respuestaNoVista solo al autor', () => {
    const d = { ...duda(), respuestaNoVista: true, notificado: { nuevaAt: new Date() } };
    d.respuestas[0].notificadoAt = new Date();
    for (const opts of [{ viewerId: String(autor), moderador: false }, { viewerId: String(otro), moderador: true }, { viewerId: null, moderador: false }]) {
      const p = toPublic(d, opts);
      assert.equal(p.notificado, undefined);
      assert.equal(JSON.stringify(p).includes('notificadoAt'), false);
    }
    assert.equal(toPublic(d, { viewerId: String(autor) }).respuestaNoVista, true);
    assert.equal(toPublic(d, { viewerId: String(otro), moderador: true }).respuestaNoVista, undefined);
    assert.equal(toPublic(d, { viewerId: null }).respuestaNoVista, undefined);
  });

  test('duda oculta: null para quien no modera', () => {
    assert.equal(toPublic({ ...duda(), oculta: true }, { viewerId: null, moderador: false }), null);
    assert.notEqual(toPublic({ ...duda(), oculta: true }, { viewerId: null, moderador: true }), null);
  });

  test('retirada expone retirada: true y campos null', () => {
    const p = toPublic({ ...duda(), retirada: true, titulo: null, texto: null, autorNombre: null, autorId: null },
      { viewerId: String(autor), moderador: false });
    assert.equal(p.retirada, true);
    assert.equal(p.titulo, null);
    assert.equal(p.mine, false);
  });
});
