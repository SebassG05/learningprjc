// Plazas añadidas por email (miembros 'pending' sin usuario) que pasan a la cuenta de quien entra.
// Solo se activan solas si el email está verificado (Google con email_verified). Con contraseña no hay
// verificación de email: activarlas por coincidencia dejaría a cualquiera registrarse con el email de
// un invitado y quedarse su plaza. En ese caso se manda a ESE email un enlace de un solo uso.
import Cohort from '../models/Cohort.js';
import CohortInvite from '../models/CohortInvite.js';
import Course from '../models/Course.js';
import { isValidEmail, normalizeEmail } from '../utils/email.js';
import { createInvite } from './cohortInvites.js';
import { sendCohortInviteEmail } from './mailService.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const CLAIM_LINK_TTL_DAYS = 7;

const pendingFilter = (email, userId) => ({
  members: { $elemMatch: { email, status: 'pending', user: null } },
  'members.user': { $ne: userId }, // si ya está en esa cohorte con su cuenta, no se toca
});

/**
 * @param {{ _id, email }} user
 * @param {{ verified?: boolean, now?: Date }} options
 * @returns {Promise<{ activated: number, emailed: number }>}
 */
export async function claimPendingMemberships(user, { verified = false, now = new Date() } = {}) {
  const email = normalizeEmail(user?.email);
  if (!user?._id || !isValidEmail(email)) return { activated: 0, emailed: 0 };

  if (verified) {
    const { modifiedCount } = await Cohort.updateMany(
      pendingFilter(email, user._id),
      { $set: { 'members.$[m].user': user._id, 'members.$[m].status': 'active' } },
      { arrayFilters: [{ 'm.email': email, 'm.status': 'pending', 'm.user': null }] },
    );
    return { activated: modifiedCount, emailed: 0 };
  }

  const cohorts = await Cohort.find(pendingFilter(email, user._id)).select('name course startsAt').lean();
  let emailed = 0;
  for (const cohort of cohorts) {
    // Como mucho un enlace por cohorte y día, aunque entre muchas veces
    const recent = await CohortInvite.exists({ cohort: cohort._id, email, createdBy: null, createdAt: { $gt: new Date(now - DAY_MS) } });
    if (recent) continue;
    const expiresAt = new Date(now.getTime() + CLAIM_LINK_TTL_DAYS * DAY_MS);
    const { url } = await createInvite({ cohortId: cohort._id, email, maxUses: 1, expiresAt });
    const course = await Course.findById(cohort.course).select('title titleEn').lean();
    await sendCohortInviteEmail({ to: email, url, courseTitle: course?.title || course?.titleEn, cohortName: cohort.name, startsAt: cohort.startsAt, expiresAt, reason: 'claim' });
    emailed += 1;
  }
  return { activated: 0, emailed };
}

// Para los controladores de login: nunca rompe el inicio de sesión
export async function claimPendingMembershipsSafely(user, options) {
  try {
    return await claimPendingMemberships(user, options);
  } catch (err) {
    console.error('No se pudieron revisar las plazas pendientes de cohortes:', err.message);
    return { activated: 0, emailed: 0 };
  }
}

// Campo opcional de la respuesta de login: solo si ha pasado algo
export const claimSummary = (claim) => (claim.activated || claim.emailed ? { cohortClaim: claim } : {});
