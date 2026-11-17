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
//   profesor activo del curso (privado)     → readonly (teacher)  salvo que una cohorte le dé algo mejor
// Con varias cohortes gana la mejor. Un profesor lleva además `teacher: true` en cualquier caso (el resto, `teacher: false`).
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Cohort from '../models/Cohort.js';
import User from '../models/User.js';

const ADMIN_ROLES = new Set(['admin', 'superadmin']);

// Cuanto mayor, mejor (para elegir entre varias cohortes)
const RANK = { member: 4, teacher: 3.5, ended: 3, reserved: 2, revoked: 1 };

const sameId = (a, b) => a != null && b != null && String(a) === String(b);

export const isPrivate = (course) => course?.accessMode === 'private';

// ¿Es el visitante profesor activo del curso? Mira course.profesores (si no se cargó, no hay profesores).
// accessFor/canAccessCourse hacen la misma pregunta a la base de datos cuando el curso no trae la lista:
// si cambias esta regla, cambia también teacherQuery.
export function isCourseTeacher(viewer, course) {
  if (!viewer?.id) return false;
  return (course?.profesores ?? []).some((p) => p.status === 'active' && sameId(p.userId, viewer.id));
}

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
  const teacher = isCourseTeacher(user, course);
  if (user && ADMIN_ROLES.has(user.role)) return { level: 'full', reason: 'admin', teacher };
  if (!isPrivate(course)) return { level: 'full', reason: 'public', teacher };
  if (!user?.id) return { level: 'denied', reason: 'anonymous', teacher: false };

  let best = null;
  for (const cohort of cohorts) {
    if (!sameId(cohort.course, course._id)) continue;
    const isMember = (cohort.members ?? []).some((m) => m.status === 'active' && sameId(m.user, user.id));
    if (!isMember) continue;
    const candidate = cohortAccess(cohort, now);
    if (!best || RANK[candidate.reason] > RANK[best.reason]) best = candidate;
  }
  if (teacher && (!best || RANK[best.reason] < RANK.teacher)) return { level: 'readonly', reason: 'teacher', teacher: true };
  if (best) return { ...best, teacher };
  return { level: 'denied', reason: 'not-member', teacher: false };
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

// Misma regla que isCourseTeacher, resuelta en la base de datos (profesores es select:false y no
// viaja con el curso). Con índice en profesores.userId.
const teacherQuery = (courseId, userId) => Course.exists({
  _id: courseId,
  profesores: { $elemMatch: { userId, status: 'active' } },
});

/**
 * Acceso a un curso ya cargado (necesita _id y accessMode). Con sesión consulta si el usuario es
 * profesor del curso, también en los públicos (el flag `teacher` hace falta en todos).
 * @returns {Promise<{ level, reason, startsAt?, endsAt?, teacher: boolean }>}
 */
export async function accessFor(reqUser, course, now = new Date()) {
  const userId = reqUser?.id ?? reqUser?._id;
  const hasViewer = Boolean(userId) && mongoose.isValidObjectId(userId);
  if (!hasViewer) return resolveAccess({ user: null, course, cohorts: [], now });

  // profesores es select:false: si el curso no trae la lista (un documento de Mongoose la rellena con []
  // aunque no se haya cargado, de ahí isSelected), se pregunta aparte
  const loaded = typeof course.isSelected === 'function' ? course.isSelected('profesores') : course.profesores !== undefined;
  const asTeacher = !loaded && (await teacherQuery(course._id, userId));
  // Objeto plano: course puede ser un documento de Mongoose y un spread perdería sus campos
  const known = loaded
    ? course
    : { _id: course._id, accessMode: course.accessMode, profesores: asTeacher ? [{ status: 'active', userId }] : [] };

  // Público: solo importa el flag de profesor. Si la consulta acierta, se comprueba que el usuario siga
  // activo (un JWT válido de un usuario desactivado o borrado cuenta como anónimo); si no, ni se consulta.
  if (!isPrivate(course)) {
    const user = loaded || asTeacher ? await loadViewer(reqUser) : { id: String(userId) };
    return resolveAccess({ user, course: loaded ? course : known, cohorts: [], now });
  }

  const viewer = await loadViewer(reqUser);
  const cohorts = viewer && !isAdminViewer(viewer) ? await activeCohortsOf(course._id, viewer.id) : [];
  return resolveAccess({ user: viewer, course: known, cohorts, now });
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
export const publicAccess = ({ level, reason, startsAt, endsAt, teacher }) => ({
  level,
  reason,
  ...(startsAt && { startsAt }),
  ...(endsAt && { endsAt }),
  teacher: teacher === true,
});

// 'read': ver contenido, progreso, tests autocorregidos. 'write': inscribirse, entregar, borrar entregas.
const ALLOWED = { read: new Set(['full', 'readonly']), write: new Set(['full']) };

export const allows = (level, action) => ALLOWED[action]?.has(level) ?? false;

// Publicar (dudas y respuestas): quien tiene acceso completo, los profesores del curso y los admins.
// Un profesor publica aunque su acceso sea de solo lectura.
export const canPublish = (access, viewer) =>
  allows(access?.level, 'write') || access?.teacher === true || isAdminViewer(viewer);

// Moderar (ocultar, borrar): profesores del curso y admins.
export const canModerate = (access, viewer) => access?.teacher === true || isAdminViewer(viewer);

// Ficha sin URLs de materiales: el temario (títulos, tipos, cuántos hay) sigue visible para quien no
// tiene acceso. Recibe un objeto plano (toObject/lean) y devuelve una copia.
const stripFiles = ({ archivo, archivoEn, ...rest }) => rest;

export function redactCourse(course) {
  if (!Array.isArray(course.temas)) return { ...course };
  return {
    ...course,
    // Sin el vídeo del tema (su public_id basta para construir la URL); el índice y los conceptos sí se ven
    temas: course.temas.map(({ video, ...tema }) => ({
      ...tema,
      materiales: (tema.materiales ?? []).map(stripFiles),
      actividadesOptativas: (tema.actividadesOptativas ?? []).map(stripFiles),
    })),
  };
}
