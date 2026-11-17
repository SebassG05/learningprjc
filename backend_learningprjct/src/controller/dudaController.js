// Dudas del curso: preguntas, respuestas, moderación y bandejas de profesores y admin.
// El curso sale siempre de la base de datos (middleware courseAccess), nunca del body. El viewer se
// deriva con loadViewer: un usuario desactivado o borrado con JWT válido es anónimo y no escribe.
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Duda from '../models/Duda.js';
import { canModerate, canPublish, isAdminViewer, loadViewer } from '../service/courseAccess.js';
import { lanzarAviso, notificarDudaNueva, notificarRespuesta } from '../service/dudaNotifications.js';
import { nombrePublico, recalcularEstado, retirarDuda, rolDe, toPublic } from '../service/dudaRules.js';

export const ESTADOS = ['abierta', 'respondida', 'resuelta'];
export const ACCIONES = ['resolver', 'reabrir', 'fijar', 'desfijar', 'ocultar', 'mostrar'];
const MAX_LISTA = 300;
const MAX_PAGINA = 50;
const CURSO_FIELDS = 'title titleEn';

const same = (a, b) => Boolean(a && b && String(a) === String(b));

function fail(res, status, error, errors) {
  return res.status(status).json(errors ? { error, errors } : { error });
}

const temaInvalido = (res) => fail(res, 400, 'El tema no existe en este curso', [{ campo: 'temaId', mensaje: 'El tema no existe en este curso' }]);

// 400 con { error, errors } si express-validator encontró problemas. true = ya respondido.
export function invalid(req, res) {
  const result = validationResult(req);
  if (result.isEmpty()) return false;
  const errors = result.array().map((e) => ({ campo: e.path, mensaje: e.msg }));
  res.status(400).json({ error: errors[0].mensaje, errors });
  return true;
}

// Quien escribe necesita sesión y cuenta activa
async function viewerOrFail(req, res) {
  const viewer = await loadViewer(req.user);
  if (!viewer) {
    fail(res, 401, 'Inicia sesión para participar');
    return null;
  }
  return viewer;
}

const view = (req, viewer) => ({
  moderador: canModerate(req.courseAccess, viewer),
  viewerId: viewer?.id ?? null,
});

const publicOf = (req, viewer, duda) => toPublic(duda, view(req, viewer));

// Duda de la petición (el middleware ya comprobó que el curso existe y que se puede leer).
// Una duda oculta no existe para quien no modera.
async function loadDuda(req, res, viewer, { allowAuthor = false } = {}) {
  const duda = await Duda.findById(req.params.dudaId);
  if (!duda) {
    fail(res, 404, 'Duda no encontrada');
    return null;
  }
  if (duda.oculta && !canModerate(req.courseAccess, viewer) && !(allowAuthor && same(duda.autorId, viewer?.id))) {
    fail(res, 404, 'Duda no encontrada');
    return null;
  }
  return duda;
}

const touch = (duda) => { duda.ultimaActividad = new Date(); };

// temaId válido: 'general' o el _id de un tema del curso
async function temaExiste(cursoId, temaId) {
  if (temaId === 'general') return true;
  if (!mongoose.isValidObjectId(temaId)) return false;
  return Boolean(await Course.exists({ _id: cursoId, 'temas._id': temaId }));
}

// ---------- Curso ----------

export async function listarDudas(req, res) {
  if (invalid(req, res)) return;
  const viewer = await loadViewer(req.user);
  const moderador = canModerate(req.courseAccess, viewer);
  const cursoId = req.courseAccess.course._id;
  const { temaId, estado } = req.query;
  if (temaId && !(await temaExiste(cursoId, String(temaId)))) return temaInvalido(res);

  const filter = { cursoId };
  if (temaId) filter.temaId = String(temaId);
  if (estado) filter.estado = String(estado);
  if (!moderador) filter.oculta = false;
  const dudas = await Duda.find(filter).sort({ fijada: -1, ultimaActividad: -1 }).limit(MAX_LISTA);
  return res.json(dudas.map((d) => toPublic(d, { viewerId: viewer?.id, moderador })).filter(Boolean));
}

export async function crearDuda(req, res) {
  if (invalid(req, res)) return;
  const viewer = await viewerOrFail(req, res);
  if (!viewer) return;
  if (!canPublish(req.courseAccess, viewer)) return fail(res, 403, 'Este curso está en modo solo lectura: no puedes publicar');
  const cursoId = req.courseAccess.course._id;
  const { temaId, titulo, texto, lang } = req.body;
  if (!(await temaExiste(cursoId, temaId))) return temaInvalido(res);

  const user = await User.findById(viewer.id).select('name').lean();
  const rol = rolDe({ access: req.courseAccess, viewer });
  const duda = await Duda.create({
    cursoId,
    temaId,
    lang: lang ?? 'es',
    autorId: viewer.id,
    autorNombre: nombrePublico(user?.name, rol),
    titulo,
    texto,
    ultimaActividad: new Date(),
  });
  lanzarAviso(notificarDudaNueva(duda), 'nueva');
  return res.status(201).json(publicOf(req, viewer, duda));
}

// ---------- Duda ----------

export async function editarDuda(req, res) {
  if (invalid(req, res)) return;
  const viewer = await viewerOrFail(req, res);
  if (!viewer) return;
  const duda = await loadDuda(req, res, viewer);
  if (!duda) return;
  if (!same(duda.autorId, viewer.id)) return fail(res, 403, 'Solo el autor puede editar su duda');
  if (!canPublish(req.courseAccess, viewer)) return fail(res, 403, 'Este curso está en modo solo lectura');
  if (duda.retirada) return fail(res, 409, 'La duda está retirada');
  if (req.body.titulo !== undefined) duda.titulo = req.body.titulo;
  if (req.body.texto !== undefined) duda.texto = req.body.texto;
  touch(duda);
  await duda.save();
  return res.json(publicOf(req, viewer, duda));
}

export async function borrarDuda(req, res) {
  const viewer = await viewerOrFail(req, res);
  if (!viewer) return;
  // El autor puede retirar también su duda oculta; el resto de acciones sobre una oculta siguen siendo 404
  const duda = await loadDuda(req, res, viewer, { allowAuthor: true });
  if (!duda) return;
  const autor = same(duda.autorId, viewer.id);
  if (!autor && !canModerate(req.courseAccess, viewer)) return fail(res, 403, 'No puedes borrar esta duda');

  // Borrado atómico: si mientras tanto llegó una respuesta, no borra nada
  const sinRespuestas = { _id: duda._id, 'respuestas.0': { $exists: false } };
  if ((await Duda.deleteOne(sinRespuestas)).deletedCount === 1) return res.json({ borrada: true });
  if (!autor) return fail(res, 409, 'La duda tiene respuestas: ocúltala en lugar de borrarla');

  const actual = await Duda.findById(duda._id);
  if (!actual) return res.json({ borrada: true });
  retirarDuda(actual);
  await actual.save();
  return res.json({ retirada: true, duda: publicOf(req, viewer, actual) });
}

// ---------- Respuestas ----------

export async function responder(req, res) {
  if (invalid(req, res)) return;
  const viewer = await viewerOrFail(req, res);
  if (!viewer) return;
  if (!canPublish(req.courseAccess, viewer)) return fail(res, 403, 'Este curso está en modo solo lectura: no puedes publicar');
  const duda = await loadDuda(req, res, viewer);
  if (!duda) return;

  const user = await User.findById(viewer.id).select('name').lean();
  const rol = rolDe({ access: req.courseAccess, viewer });
  duda.respuestas.push({ autorId: viewer.id, autorNombre: nombrePublico(user?.name, rol), rol, texto: req.body.texto });
  duda.estado = recalcularEstado(duda);
  if (rol !== 'alumno' && duda.autorId && !same(duda.autorId, viewer.id)) duda.respuestaNoVista = true;
  touch(duda);
  await duda.save();
  lanzarAviso(notificarRespuesta(duda, duda.respuestas[duda.respuestas.length - 1]._id), 'respuesta');
  return res.status(201).json(publicOf(req, viewer, duda));
}

async function loadRespuesta(req, res, viewer) {
  const duda = await loadDuda(req, res, viewer);
  if (!duda) return {};
  const respuesta = mongoose.isValidObjectId(req.params.respuestaId) ? duda.respuestas.id(req.params.respuestaId) : null;
  if (!respuesta || (respuesta.oculta && !canModerate(req.courseAccess, viewer))) {
    fail(res, 404, 'Respuesta no encontrada');
    return {};
  }
  return { duda, respuesta };
}

export async function editarRespuesta(req, res) {
  if (invalid(req, res)) return;
  const viewer = await viewerOrFail(req, res);
  if (!viewer) return;
  const { duda, respuesta } = await loadRespuesta(req, res, viewer);
  if (!respuesta) return;
  if (!same(respuesta.autorId, viewer.id)) return fail(res, 403, 'Solo el autor puede editar su respuesta');
  if (!canPublish(req.courseAccess, viewer)) return fail(res, 403, 'Este curso está en modo solo lectura');
  respuesta.texto = req.body.texto;
  respuesta.editadaAt = new Date();
  touch(duda);
  await duda.save();
  return res.json(publicOf(req, viewer, duda));
}

export async function borrarRespuesta(req, res) {
  const viewer = await viewerOrFail(req, res);
  if (!viewer) return;
  const { duda, respuesta } = await loadRespuesta(req, res, viewer);
  if (!respuesta) return;
  if (!same(respuesta.autorId, viewer.id)) return fail(res, 403, 'Solo el autor puede borrar su respuesta');
  duda.respuestas.pull(respuesta._id);
  duda.estado = recalcularEstado(duda);
  await duda.save();
  return res.json(publicOf(req, viewer, duda));
}

// ---------- Estado y moderación ----------

export async function cambiarEstado(req, res) {
  if (invalid(req, res)) return;
  const viewer = await viewerOrFail(req, res);
  if (!viewer) return;
  const duda = await loadDuda(req, res, viewer);
  if (!duda) return;
  const { accion, respuestaId } = req.body;
  const moderador = canModerate(req.courseAccess, viewer);

  if (accion === 'resolver' || accion === 'reabrir') {
    if (!moderador && !same(duda.autorId, viewer.id)) return fail(res, 403, 'Solo el autor o el profesorado pueden cambiar el estado');
    // Reabrir devuelve la duda a la bandeja del profesorado: no desde una cohorte de solo lectura
    if (accion === 'reabrir' && !moderador && !canPublish(req.courseAccess, viewer)) return fail(res, 403, 'Este curso está en modo solo lectura');
    touch(duda);
    duda.estado = 'abierta';
    if (accion === 'resolver') duda.estado = 'resuelta';
    else duda.estado = recalcularEstado(duda);
  } else {
    if (!moderador) return fail(res, 403, 'Solo el profesorado puede moderar');
    const oculta = accion === 'ocultar';
    if (accion === 'fijar' || accion === 'desfijar') {
      duda.fijada = accion === 'fijar';
    } else if (respuestaId) {
      const respuesta = duda.respuestas.id(respuestaId);
      if (!respuesta) return fail(res, 404, 'Respuesta no encontrada');
      respuesta.oculta = oculta;
      duda.estado = recalcularEstado(duda);
    } else {
      duda.oculta = oculta;
    }
  }
  await duda.save();
  return res.json(publicOf(req, viewer, duda));
}

export async function marcarVista(req, res) {
  const viewer = await viewerOrFail(req, res);
  if (!viewer) return;
  const duda = await loadDuda(req, res, viewer);
  if (!duda) return;
  if (!same(duda.autorId, viewer.id)) return fail(res, 403, 'Solo el autor puede marcar las respuestas como vistas');
  duda.respuestaNoVista = false;
  await duda.save();
  return res.json(publicOf(req, viewer, duda));
}

export async function reportar(req, res) {
  if (invalid(req, res)) return;
  const viewer = await viewerOrFail(req, res);
  if (!viewer) return;
  const duda = await loadDuda(req, res, viewer);
  if (!duda) return;
  if (duda.reportes.some((r) => same(r.userId, viewer.id))) return fail(res, 409, 'Ya has reportado esta duda');
  duda.reportes.push({ userId: viewer.id, motivo: req.body.motivo ?? '' });
  await duda.save();
  return res.status(201).json({ reportada: true });
}

// ---------- Bandejas ----------

const withCurso = (duda, cursos, opts) => {
  const out = toPublic(duda, opts);
  const c = cursos.get(String(duda.cursoId));
  return out && { ...out, curso: c ? { _id: c._id, title: c.title, titleEn: c.titleEn ?? null } : { _id: duda.cursoId, title: null, titleEn: null } };
};

const cursosMap = async (ids) => new Map(
  (await Course.find({ _id: { $in: ids } }).select(CURSO_FIELDS).lean()).map((c) => [String(c._id), c]),
);

export async function dudasProfesor(req, res) {
  const viewer = await viewerOrFail(req, res);
  if (!viewer) return;
  const courses = await Course.find({ profesores: { $elemMatch: { userId: viewer.id, status: 'active' } } })
    .select(CURSO_FIELDS).lean();
  const ids = courses.map((c) => c._id);
  const dudas = ids.length
    ? await Duda.find({ cursoId: { $in: ids }, $or: [{ estado: 'abierta' }, { 'reportes.0': { $exists: true } }] })
      .sort({ ultimaActividad: -1 }).limit(MAX_LISTA)
    : [];
  const cursos = new Map(courses.map((c) => [String(c._id), c]));
  res.set('Cache-Control', 'private, no-store');
  return res.json(dudas.map((d) => withCurso(d, cursos, { moderador: true, viewerId: viewer.id })));
}

// Contadores de «mis cursos»: abiertas (sin ocultas) y dudas con al menos un reporte
export async function contarDudasPorCurso(courseIds) {
  const rows = courseIds.length
    ? await Duda.aggregate([
      { $match: { cursoId: { $in: courseIds } } },
      { $group: {
        _id: '$cursoId',
        abiertas: { $sum: { $cond: [{ $and: [{ $eq: ['$estado', 'abierta'] }, { $eq: ['$oculta', false] }] }, 1, 0] } },
        reportadas: { $sum: { $cond: [{ $gt: [{ $size: { $ifNull: ['$reportes', []] } }, 0] }, 1, 0] } },
      } },
    ])
    : [];
  return new Map(rows.map((r) => [String(r._id), r]));
}

const intParam = (value, fallback, max) => {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(n, max);
};

export async function dudasAdmin(req, res) {
  if (invalid(req, res)) return;
  // soloAdmin ya comprobó el rol; se re-deriva el viewer por si la cuenta se desactivó
  const viewer = await loadViewer(req.user);
  if (!isAdminViewer(viewer)) return fail(res, 403, 'Solo los administradores');
  const { estado, curso, reportadas } = req.query;
  const filter = {};
  if (estado) filter.estado = String(estado);
  if (curso) filter.cursoId = String(curso);
  if (reportadas === '1') filter['reportes.0'] = { $exists: true };
  const page = intParam(req.query.page, 1, 100000);
  const limit = intParam(req.query.limit, 20, MAX_PAGINA);
  const [total, dudas] = await Promise.all([
    Duda.countDocuments(filter),
    Duda.find(filter).sort({ ultimaActividad: -1, _id: -1 }).skip((page - 1) * limit).limit(limit),
  ]);
  const cursos = await cursosMap([...new Set(dudas.map((d) => String(d.cursoId)))]);
  res.set('Cache-Control', 'private, no-store');
  return res.json({
    items: dudas.map((d) => withCurso(d, cursos, { moderador: true, viewerId: viewer.id })),
    page,
    limit,
    total,
  });
}
