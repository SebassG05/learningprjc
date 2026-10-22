// Quién puede ver y hacer qué en un curso. Es la ÚNICA regla de acceso a contenido del backend:
// las rutas la aplican con middleware/courseAccess.js y el front solo refleja su resultado.
//
//   admin                                   → full     (admin)
//   curso público (o sin accessMode)        → full     (public)  · inscripción e isOpen se siguen
//                                                                   comprobando en cada controlador
//   (en un curso privado isOpen no cuenta: lo abren las fechas de la cohorte)
//   privado, sin sesión                     → denied   (anonymous)
//   privado, sin membresía activa           → denied   (not-member)
//   miembro activo, antes de startsAt       → denied   (reserved)
//   miembro activo, startsAt ≤ now < endsAt → full     (member)
//   miembro activo, now ≥ endsAt            → readonly (ended)  si afterEnd = 'readonly'
//                                             denied   (revoked) si afterEnd = 'revoke'
// Con varias cohortes gana la mejor.
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Cohort from '../models/Cohort.js';
import User from '../models/User.js';

const ADMIN_ROLES = new Set(['admin', 'superadmin']);

// Cuanto mayor, mejor (para elegir entre varias cohortes)
const RANK = { member: 4, ended: 3, reserved: 2, revoked: 1 };

const sameId = (a, b) => a != null && b != null && String(a) === String(b);

export const isPrivate = (course) => course?.accessMode === 'private';

function cohortAccess(cohort, now) {
  const { startsAt, endsAt } = cohort;
  if (now < startsAt) return { level: 'denied', reason: 'reserved', startsAt, endsAt };
  if (now < endsAt) return { level: 'full', reason: 'member', startsAt, endsAt };
  return cohort.afterEnd === 'revoke'
    ? { level: 'denied', reason: 'revoked', startsAt, endsAt }
    : { level: 'readonly', reason: 'ended', startsAt, endsAt };
}

/**
 * @param {{ user: {id, role}|null, course: {_id, accessMode}, cohorts: Array, now?: Date }} input
 * @returns {{ level: 'full'|'readonly'|'denied', reason: string, startsAt?: Date, endsAt?: Date }}
 */
export function resolveAccess({ user, course, cohorts = [], now = new Date() }) {
  if (user && ADMIN_ROLES.has(user.role)) return { level: 'full', reason: 'admin' };
  if (!isPrivate(course)) return { level: 'full', reason: 'public' };
  if (!user?.id) return { level: 'denied', reason: 'anonymous' };

  let best = null;
  for (const cohort of cohorts) {
    if (!sameId(cohort.course, course._id)) continue;
    const isMember = (cohort.members ?? []).some((m) => m.status === 'active' && sameId(m.user, user.id));
    if (!isMember) continue;
    const candidate = cohortAccess(cohort, now);
    if (!best || RANK[candidate.reason] > RANK[best.reason]) best = candidate;
  }
  return best ?? { level: 'denied', reason: 'not-member' };
}

// ============= Carga desde la base de datos =============

// Quién pide, con su rol. req.user puede ser el payload del JWT ({ id, email }) o un User completo
// (middleware autenticar). El JWT no lleva el rol, así que se lee; un usuario desactivado o borrado
// se trata como anónimo.
export async function loadViewer(reqUser) {
  const id = reqUser?.id ?? reqUser?._id;
  if (!id || !mongoose.isValidObjectId(id)) return null;
  const user = await User.findById(id).select('role activo').lean();
  if (!user || user.activo === false) return null;
  return { id: String(user._id), role: user.role };
}

export const isAdminViewer = (viewer) => Boolean(viewer && ADMIN_ROLES.has(viewer.role));

// Solo las cohortes del curso en las que el usuario es miembro activo, y de ellas solo su fila
const activeCohortsOf = (courseId, userId) => {
  const mine = { user: userId, status: 'active' };
  return Cohort.find(
    { course: courseId, members: { $elemMatch: mine } },
    { course: 1, startsAt: 1, endsAt: 1, afterEnd: 1, members: { $elemMatch: mine } },
  ).lean();
};

/**
 * Acceso a un curso ya cargado (necesita _id y accessMode). Los públicos no tocan la base de datos.
 * @returns {Promise<{ level, reason, startsAt?, endsAt? }>}
 */
export async function accessFor(reqUser, course, now = new Date()) {
  if (!isPrivate(course)) return { level: 'full', reason: 'public' };
  const viewer = await loadViewer(reqUser);
  const cohorts = viewer && !isAdminViewer(viewer) ? await activeCohortsOf(course._id, viewer.id) : [];
  return resolveAccess({ user: viewer, course, cohorts, now });
}

/**
 * Carga el curso por id y resuelve el acceso. null si el id no es válido o el curso no existe.
 * @returns {Promise<null | { level, reason, startsAt?, endsAt?, course }>}
 */
export async function canAccessCourse(reqUser, courseId, now = new Date()) {
  if (!courseId || !mongoose.isValidObjectId(courseId)) return null;
  const course = await Course.findById(courseId).select('accessMode isOpen').lean();
  if (!course) return null;
  return { ...(await accessFor(reqUser, course, now)), course };
}

// Lo que se cuenta al cliente (el front pinta «Plaza reservada», «solo lectura»…)
export const publicAccess = ({ level, reason, startsAt, endsAt }) => ({
  level,
  reason,
  ...(startsAt && { startsAt }),
  ...(endsAt && { endsAt }),
});

// 'read': ver contenido, progreso, tests autocorregidos. 'write': inscribirse, entregar, borrar entregas.
const ALLOWED = { read: new Set(['full', 'readonly']), write: new Set(['full']) };

export const allows = (level, action) => ALLOWED[action]?.has(level) ?? false;

// Ficha sin URLs de materiales: el temario (títulos, tipos, cuántos hay) sigue visible para quien no
// tiene acceso. Recibe un objeto plano (toObject/lean) y devuelve una copia.
const stripFiles = ({ archivo, archivoEn, ...rest }) => rest;

export function redactCourse(course) {
  if (!Array.isArray(course.temas)) return { ...course };
  return {
    ...course,
    temas: course.temas.map((tema) => ({
      ...tema,
      materiales: (tema.materiales ?? []).map(stripFiles),
      actividadesOptativas: (tema.actividadesOptativas ?? []).map(stripFiles),
    })),
  };
}
