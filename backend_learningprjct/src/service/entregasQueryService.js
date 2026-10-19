// Listado de entregas para el panel de correcciones: filtros, búsqueda, orden y paginación en servidor.
// La respuesta conserva la forma de populate(): userId/ejercicioId/cursoId son objetos o null.
import mongoose from 'mongoose';
import { ESTADOS_ENTREGA } from './correccionService.js';

export const ORDENES = ['prioridad', 'recientes', 'antiguas', 'nota'];
export const LIMIT_DEFAULT = 20;
export const LIMIT_MAX = 100;
const Q_MAX = 100;

// Parámetros que activan el modo paginado. Sin ninguno, el endpoint responde como siempre.
export const PARAMS_LISTADO = ['page', 'limit', 'estado', 'curso', 'q', 'desde', 'hasta', 'orden'];
export const usaListado = (query = {}) => PARAMS_LISTADO.some((k) => query[k] !== undefined);

export class ListadoError extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.status = 400;
  }
}

const entero = (v, def, min, max) => {
  if (v === undefined || v === '') return def;
  const n = Number(v);
  if (!Number.isInteger(n) || n < min) throw new ListadoError(`Valor no válido: ${v}`);
  return Math.min(n, max);
};

const fecha = (v, nombre) => {
  if (v === undefined || v === '') return undefined;
  const d = new Date(v);
  if (!Number.isFinite(d.getTime())) throw new ListadoError(`Fecha no válida en «${nombre}»`);
  return d;
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Valida y normaliza la query string. Lanza ListadoError (400) ante valores inválidos.
export function parseListado(query = {}) {
  const estado = query.estado || undefined;
  if (estado && !ESTADOS_ENTREGA.includes(estado)) throw new ListadoError('Estado no válido');

  const curso = query.curso || undefined;
  if (curso && !mongoose.isValidObjectId(curso)) throw new ListadoError('Curso no válido');

  const orden = query.orden || 'prioridad';
  if (!ORDENES.includes(orden)) throw new ListadoError('Orden no válido');

  const desde = fecha(query.desde, 'desde');
  let hasta = fecha(query.hasta, 'hasta');
  // «hasta» con solo el día incluye el día completo
  if (hasta && /^\d{4}-\d{2}-\d{2}$/.test(query.hasta)) hasta = new Date(hasta.getTime() + 864e5 - 1);

  const q = typeof query.q === 'string' ? query.q.trim().slice(0, Q_MAX) : '';

  return {
    estado,
    curso,
    orden,
    desde,
    hasta,
    q,
    page: entero(query.page, 1, 1, 10_000),
    limit: entero(query.limit, LIMIT_DEFAULT, 1, LIMIT_MAX),
  };
}

// Equivale a populate(campo, campos): objeto o null si el documento ya no existe.
// Forma let + pipeline (MongoDB ≥ 3.6): no depende de la versión del servidor.
const lookupUno = (from, localField, as, campos) => [
  {
    $lookup: {
      from,
      let: { ref: `$${localField}` },
      pipeline: [
        { $match: { $expr: { $eq: ['$_id', '$$ref'] } } },
        { $project: Object.fromEntries(campos.map((c) => [c, 1])) },
      ],
      as,
    },
  },
  { $set: { [as]: { $ifNull: [{ $arrayElemAt: [`$${as}`, 0] }, null] } } },
];

const ORDEN_SORT = {
  // Lo pendiente primero (lo más antiguo arriba); lo ya corregido después (lo más reciente arriba)
  prioridad: { _pendiente: 1, _clave: 1, _id: 1 },
  recientes: { fechaEntrega: -1, _id: -1 },
  antiguas: { fechaEntrega: 1, _id: 1 },
  nota: { _sinNota: 1, calificacion: -1, fechaEntrega: -1, _id: -1 },
};

/**
 * Pipeline de agregación. Las cifras por estado (stats) se calculan con todos los filtros
 * salvo el de estado: así las tarjetas dicen cuántas hay de cada uno para la búsqueda actual.
 */
export function buildListadoPipeline(f, colecciones) {
  const base = {};
  if (f.curso) base.cursoId = new mongoose.Types.ObjectId(f.curso);
  if (f.desde || f.hasta) {
    base.fechaEntrega = {};
    if (f.desde) base.fechaEntrega.$gte = f.desde;
    if (f.hasta) base.fechaEntrega.$lte = f.hasta;
  }

  const pipeline = [
    { $match: base },
    ...lookupUno(colecciones.users, 'userId', 'userId', ['name', 'email']),
    ...lookupUno(colecciones.ejercicios, 'ejercicioId', 'ejercicioId', ['titulo', 'tipo', 'dificultad']),
    ...lookupUno(colecciones.courses, 'cursoId', 'cursoId', ['title', 'titleEn']),
  ];

  if (f.q) {
    const rx = { $regex: escapeRegex(f.q), $options: 'i' };
    pipeline.push({
      $match: {
        $or: [
          { 'userId.name': rx },
          { 'userId.email': rx },
          { 'ejercicioId.titulo': rx },
          { 'cursoId.title': rx },
          { 'cursoId.titleEn': rx },
        ],
      },
    });
  }

  const filtradas = f.estado ? [{ $match: { estado: f.estado } }] : [];
  const orden =
    f.orden === 'prioridad'
      ? [
          {
            $set: {
              _pendiente: { $cond: [{ $eq: ['$estado', 'enviado'] }, 0, 1] },
              _clave: {
                $cond: [
                  { $eq: ['$estado', 'enviado'] },
                  { $toLong: '$fechaEntrega' },
                  { $multiply: [-1, { $toLong: '$fechaEntrega' }] },
                ],
              },
            },
          },
        ]
      : f.orden === 'nota'
        ? [{ $set: { _sinNota: { $cond: [{ $eq: [{ $type: '$calificacion' }, 'missing'] }, 1, 0] } } }]
        : [];

  pipeline.push({
    $facet: {
      stats: [{ $group: { _id: '$estado', n: { $sum: 1 } } }],
      total: [...filtradas, { $count: 'n' }],
      entregas: [
        ...filtradas,
        ...orden,
        { $sort: ORDEN_SORT[f.orden] },
        { $skip: (f.page - 1) * f.limit },
        { $limit: f.limit },
        { $unset: ['_pendiente', '_clave', '_sinNota', 'notificado', '__v'] },
      ],
    },
  });
  return pipeline;
}

// Resultado del $facet → respuesta del endpoint
export function formatListado([res = {}] = [], f) {
  const stats = Object.fromEntries(ESTADOS_ENTREGA.map((e) => [e, 0]));
  (res.stats ?? []).forEach(({ _id, n }) => {
    if (_id in stats) stats[_id] = n;
  });
  stats.total = Object.values(stats).reduce((a, b) => a + b, 0);
  const total = res.total?.[0]?.n ?? 0;
  return {
    entregas: res.entregas ?? [],
    total,
    page: f.page,
    limit: f.limit,
    pages: Math.max(1, Math.ceil(total / f.limit)),
    stats,
  };
}
