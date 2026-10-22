// Aplica la regla de service/courseAccess.js a una ruta. Va después de authenticateJWT / optionalAuth
// (lee req.user) y deja el resultado en req.courseAccess para el controlador.
//
//   requireCourseAccess('read',  fromParam('cursoId'))  → ver contenido (full o readonly)
//   requireCourseAccess('write', fromParam('courseId')) → inscribirse, entregar, borrar entregas (solo full)
//
// courseIdFrom(req) devuelve el id del curso (o una promesa); null/undefined → 404.
import mongoose from 'mongoose';
import Ejercicio from '../models/Ejercicio.js';
import EntregaEjercicio from '../models/EntregaEjercicio.js';
import { allows, canAccessCourse, isPrivate, publicAccess } from '../service/courseAccess.js';

export const fromParam = (name) => (req) => req.params[name];

const DENIED_MESSAGES = {
  anonymous: 'Inicia sesión para acceder a este curso',
  'not-member': 'Curso privado: acceso solo por invitación',
  reserved: 'Tu plaza está reservada: el curso todavía no ha empezado',
  revoked: 'Esta edición del curso ha terminado',
  ended: 'Esta edición del curso ha terminado: el contenido está en modo solo lectura',
};

// Respuesta que depende de quién pregunta: ninguna caché compartida debe reutilizarla
export const noSharedCache = (res) => {
  res.set('Cache-Control', 'private, no-store');
  res.vary('Authorization');
};

// 401 si falta sesión, 403 en el resto; `access` le dice al front qué pintar
export const denyAccess = (res, access) =>
  res.status(access.reason === 'anonymous' ? 401 : 403).json({
    error: DENIED_MESSAGES[access.reason] ?? 'No tienes acceso a este curso',
    access: publicAccess(access),
  });

export const requireCourseAccess = (action, courseIdFrom) => async (req, res, next) => {
  try {
    const access = await canAccessCourse(req.user, await courseIdFrom(req));
    if (!access) return res.status(404).json({ error: 'Curso no encontrado' });
    if (isPrivate(access.course)) noSharedCache(res);

    if (!allows(access.level, action)) return denyAccess(res, access);
    req.courseAccess = access;
    return next();
  } catch (err) {
    return next(err);
  }
};

// El curso sale siempre de la base de datos (nunca del body): el ejercicio sabe a qué curso pertenece
export const courseIdFromEjercicio = (param = 'ejercicioId') => async (req) => {
  const id = req.params[param];
  if (!mongoose.isValidObjectId(id)) return null;
  return (await Ejercicio.findById(id).select('cursoId').lean())?.cursoId ?? null;
};

// Para una entrega manda el curso de su ejercicio; el cursoId guardado en la entrega es el respaldo
// (en entregas antiguas llegaba del body y no está garantizado)
export const courseIdFromEntrega = (param = 'entregaId') => async (req) => {
  const id = req.params[param];
  if (!mongoose.isValidObjectId(id)) return null;
  const entrega = await EntregaEjercicio.findById(id).select('ejercicioId cursoId').lean();
  return entrega ? courseIdOfEntrega(entrega) : null;
};

export async function courseIdOfEntrega(entrega) {
  const ejercicio = await Ejercicio.findById(entrega.ejercicioId).select('cursoId').lean();
  return ejercicio?.cursoId ?? entrega.cursoId ?? null;
}
