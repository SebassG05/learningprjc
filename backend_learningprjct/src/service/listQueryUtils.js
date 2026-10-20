// Utilidades comunes de los listados del panel de administración (validación de la query y agregación).

export class ListadoError extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.status = 400;
  }
}

export const entero = (v, def, min, max) => {
  if (v === undefined || v === '') return def;
  const n = Number(v);
  if (!Number.isInteger(n) || n < min) throw new ListadoError(`Valor no válido: ${v}`);
  return Math.min(n, max);
};

export const fecha = (v, nombre) => {
  if (v === undefined || v === '') return undefined;
  const d = new Date(v);
  if (!Number.isFinite(d.getTime())) throw new ListadoError(`Fecha no válida en «${nombre}»`);
  return d;
};

// «hasta» con solo el día incluye el día completo
export const fechaHasta = (v, nombre) => {
  const d = fecha(v, nombre);
  return d && /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(d.getTime() + 864e5 - 1) : d;
};

export const texto = (v, max = 100) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Equivale a populate(campo, campos): objeto o null si el documento ya no existe.
// Forma let + pipeline (MongoDB ≥ 3.6): no depende de la versión del servidor.
export const lookupUno = (from, localField, as, campos) => [
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

export const rangoFechas = (campo, desde, hasta) => {
  if (!desde && !hasta) return {};
  const r = {};
  if (desde) r.$gte = desde;
  if (hasta) r.$lte = hasta;
  return { [campo]: r };
};

// Cuenta por valor de `campo` y suma el total (los valores sin documentos quedan a 0)
export const contarPor = (grupos = [], valores) => {
  const stats = Object.fromEntries(valores.map((v) => [v, 0]));
  grupos.forEach(({ _id, n }) => {
    if (_id in stats) stats[_id] = n;
  });
  stats.total = Object.values(stats).reduce((a, b) => a + b, 0);
  return stats;
};
