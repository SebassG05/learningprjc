// Quién puede ver y hacer qué en un curso. Es la ÚNICA regla de acceso a contenido del backend:
// las rutas la aplican con middleware/courseAccess.js y el front solo refleja su resultado.
//
//   admin                                   → full     (admin)
//   curso público (o sin accessMode)        → full     (public)  · inscripción e isOpen se siguen
//                                                                   comprobando en cada controlador
//   privado, sin sesión                     → denied   (anonymous)
//   privado, sin membresía activa           → denied   (not-member)
//   miembro activo, antes de startsAt       → denied   (reserved)
//   miembro activo, startsAt ≤ now < endsAt → full     (member)
//   miembro activo, now ≥ endsAt            → readonly (ended)  si afterEnd = 'readonly'
//                                             denied   (revoked) si afterEnd = 'revoke'
// Con varias cohortes gana la mejor.

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
