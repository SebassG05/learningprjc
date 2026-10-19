// Inscripciones (UserProgress) de todos los cursos para la pestaña Reservas del panel:
// filtros, búsqueda, orden y paginación en servidor. Sirve también la vista de calendario
// (un mes entero: límite mayor y orden cronológico).
import mongoose from 'mongoose';
import { contarPor, entero, escapeRegex, fecha, fechaHasta, ListadoError, lookupUno, rangoFechas, texto } from './listQueryUtils.js';

export { ListadoError };

export const ESTADOS_INSCRIPCION = ['enrolled', 'completed'];
export const ORDENES_INSCRIPCION = ['recientes', 'antiguas', 'progreso'];
export const LIMIT_MAX_INSCRIPCIONES = 500; // un mes de calendario cabe en una petición

export function parseInscripciones(query = {}) {
  const estado = query.estado || undefined;
  if (estado && !ESTADOS_INSCRIPCION.includes(estado)) throw new ListadoError('Estado no válido');

  const curso = query.curso || undefined;
  if (curso && !mongoose.isValidObjectId(curso)) throw new ListadoError('Curso no válido');

  const orden = query.orden || 'recientes';
  if (!ORDENES_INSCRIPCION.includes(orden)) throw new ListadoError('Orden no válido');

  return {
    estado,
    curso,
    orden,
    desde: fecha(query.desde, 'desde'),
    hasta: fechaHasta(query.hasta, 'hasta'),
    q: texto(query.q),
    page: entero(query.page, 1, 1, 10_000),
    limit: entero(query.limit, 20, 1, LIMIT_MAX_INSCRIPCIONES),
  };
}

const SORT = {
  recientes: { enrolledAt: -1, _id: -1 },
  antiguas: { enrolledAt: 1, _id: 1 },
  progreso: { progress: -1, enrolledAt: -1, _id: -1 },
};

// Las cifras por estado ignoran el filtro de estado (como en Correcciones)
export function buildInscripcionesPipeline(f, colecciones) {
  const base = rangoFechas('enrolledAt', f.desde, f.hasta);
  if (f.curso) base.courseId = new mongoose.Types.ObjectId(f.curso);

  const pipeline = [
    { $match: base },
    ...lookupUno(colecciones.users, 'userId', 'userId', ['name', 'email']),
    ...lookupUno(colecciones.courses, 'courseId', 'courseId', ['title', 'titleEn']),
  ];

  if (f.q) {
    const rx = { $regex: escapeRegex(f.q), $options: 'i' };
    pipeline.push({ $match: { $or: [{ 'userId.name': rx }, { 'userId.email': rx }, { 'courseId.title': rx }, { 'courseId.titleEn': rx }] } });
  }

  const filtradas = f.estado ? [{ $match: { status: f.estado } }] : [];
  pipeline.push({
    $facet: {
      stats: [{ $group: { _id: '$status', n: { $sum: 1 } } }],
      total: [...filtradas, { $count: 'n' }],
      inscripciones: [
        ...filtradas,
        { $sort: SORT[f.orden] },
        { $skip: (f.page - 1) * f.limit },
        { $limit: f.limit },
        // Lo que el panel muestra: sin los arrays de materiales y tests completados
        { $project: { userId: 1, courseId: 1, status: 1, progress: 1, enrolledAt: 1, completedAt: 1, preferredLanguage: 1 } },
      ],
    },
  });
  return pipeline;
}

export function formatInscripciones([res = {}] = [], f) {
  const total = res.total?.[0]?.n ?? 0;
  return {
    inscripciones: res.inscripciones ?? [],
    total,
    page: f.page,
    limit: f.limit,
    pages: Math.max(1, Math.ceil(total / f.limit)),
    stats: contarPor(res.stats, ESTADOS_INSCRIPCION),
  };
}
