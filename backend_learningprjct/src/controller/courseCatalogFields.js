import { AREA_SLUGS, COURSE_LEVELS, PROFESOR_LIMITS } from '../config/courseCatalog.js';

// Error de datos del formulario de cursos: el controlador lo convierte en 400
export class CatalogFieldError extends Error {}

const clean = (v) => (typeof v === 'string' ? v.trim() : v);

/**
 * Lee nivel, área y profesor del cuerpo de crear/actualizar curso (multipart: todo llega como texto).
 * Campo ausente → no se toca; cadena vacía → se borra; valor desconocido → CatalogFieldError.
 * Sin nombre no hay profesor: vaciar el nombre borra el bloque entero.
 * Devuelve { set, unset } con rutas en notación de punto, listas para un update de Mongo.
 */
export function parseCatalogFields(body = {}, { profesorFoto } = {}) {
  const set = {};
  const unset = {};

  const pick = (key, allowed, label) => {
    if (body[key] === undefined) return;
    const value = clean(body[key]);
    if (value === '' || value === null) {
      unset[key] = '';
      return;
    }
    if (!allowed.includes(value)) throw new CatalogFieldError(`${label} no válido: ${value}`);
    set[key] = value;
  };
  pick('nivel', COURSE_LEVELS, 'Nivel');
  pick('area', AREA_SLUGS, 'Área');

  const touchesProfesor =
    Boolean(profesorFoto) || ['profesorNombre', 'profesorBio', 'profesorQuitarFoto'].some((k) => body[k] !== undefined);
  if (!touchesProfesor) return { set, unset };

  const nombre = clean(body.profesorNombre);
  const bio = clean(body.profesorBio);
  if (nombre === '') {
    unset.profesor = '';
    return { set, unset };
  }
  if (typeof nombre === 'string' && nombre.length > PROFESOR_LIMITS.nombre) {
    throw new CatalogFieldError(`El nombre del profesor admite ${PROFESOR_LIMITS.nombre} caracteres como máximo`);
  }
  if (typeof bio === 'string' && bio.length > PROFESOR_LIMITS.bio) {
    throw new CatalogFieldError(`La bio del profesor admite ${PROFESOR_LIMITS.bio} caracteres como máximo`);
  }

  if (nombre) set['profesor.nombre'] = nombre;
  if (bio !== undefined) {
    if (bio) set['profesor.bio'] = bio;
    else unset['profesor.bio'] = '';
  }
  if (profesorFoto) set['profesor.foto'] = profesorFoto;
  else if (body.profesorQuitarFoto === true || body.profesorQuitarFoto === 'true') unset['profesor.foto'] = '';

  return { set, unset };
}

// Para crear: convierte las rutas con punto en un documento anidado (lo vacío simplemente no se guarda)
export function catalogFieldsForCreate(set) {
  const doc = {};
  for (const [path, value] of Object.entries(set)) {
    const [head, tail] = path.split('.');
    if (tail) doc[head] = { ...doc[head], [tail]: value };
    else doc[head] = value;
  }
  if (doc.profesor && !doc.profesor.nombre) {
    throw new CatalogFieldError('El profesor necesita un nombre');
  }
  return doc;
}
