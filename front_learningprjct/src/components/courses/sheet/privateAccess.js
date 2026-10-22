// Cursos privados (acceso por cohortes): qué pintar en la ficha según `course.access`, que decide el
// backend. Esto es solo presentación: la seguridad está en el servidor.

/**
 * @returns {{ view: 'open'|'checking'|'invite-only'|'reserved'|'member'|'readonly'|'ended', needsLogin?, startsAt?, endsAt? }}
 */
export function accessView(course) {
  if (course?.accessMode !== 'private') return { view: 'open' };
  const access = course.access;
  if (!access) return { view: 'checking' }; // versión del listado: aún no sabemos quién la mira
  if (access.level === 'full') return { view: 'member' };
  if (access.level === 'readonly') return { view: 'readonly', endsAt: access.endsAt };
  if (access.reason === 'reserved') return { view: 'reserved', startsAt: access.startsAt };
  if (access.reason === 'revoked') return { view: 'ended' };
  return { view: 'invite-only', needsLogin: access.reason === 'anonymous' };
}

/**
 * Estado del botón principal: el de siempre (enroll/reserve/enrolled/reserved) o uno de curso privado.
 * interest / interested · cohort-reserved · closed · checking
 */
export function ctaState({ view }, baseState, { interested = false } = {}) {
  switch (view) {
    case 'checking':
      return 'checking';
    case 'invite-only':
    case 'ended':
      return interested ? 'interested' : 'interest';
    case 'reserved':
      return 'cohort-reserved';
    case 'readonly':
      return baseState === 'enrolled' ? 'enrolled' : 'closed';
    default:
      return baseState;
  }
}

// Estados del botón que no hacen nada al pulsarlos (se anuncian como deshabilitados)
export const INERT_CTA = new Set(['reserved', 'cohort-reserved', 'closed', 'interested', 'checking']);

export const formatCohortDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Madrid' })
    : '';
