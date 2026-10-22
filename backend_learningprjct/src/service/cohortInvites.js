// Invitaciones a cohortes por enlace.
// - El token (32 bytes aleatorios, base64url) solo existe en claro en la respuesta de creación y en el
//   enlace; en la base de datos se guarda su SHA-256.
// - Canjear es idempotente: si ya es miembro no se duplica ni se gasta uso.
// - Los usos se gastan con un único update condicional (uses < maxUses), así que dos canjes a la vez
//   del último uso no pueden entrar los dos.
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import Cohort from '../models/Cohort.js';
import CohortInvite from '../models/CohortInvite.js';
import Course from '../models/Course.js';
import { isValidEmail, normalizeEmail } from '../utils/email.js';

const DEFAULT_TTL_DAYS = 14;
const MAX_TOKEN_LENGTH = 200;

export class InviteError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const frontendUrl = () => (process.env.FRONTEND_URL || 'https://campus.evenor-tech.com').replace(/\/+$/, '');
export const inviteUrl = (courseId, token) => `${frontendUrl()}/curso/${courseId}/invitacion?token=${encodeURIComponent(token)}`;

/**
 * @param {{ cohortId, createdBy?, email?, maxUses?, expiresAt? }} input — createdBy null = generada por el sistema
 * @returns {Promise<{ invite, token, url }>}
 */
export async function createInvite({ cohortId, createdBy = null, email, maxUses = 1, expiresAt }) {
  const cohort = mongoose.isValidObjectId(cohortId) ? await Cohort.findById(cohortId).select('course').lean() : null;
  if (!cohort) throw new InviteError('cohort-not-found');

  const expires = expiresAt ? new Date(expiresAt) : new Date(Date.now() + DEFAULT_TTL_DAYS * 24 * 60 * 60 * 1000);
  if (Number.isNaN(expires.getTime()) || expires <= new Date()) throw new InviteError('bad-expiry');

  const uses = Number(maxUses);
  if (!Number.isInteger(uses) || uses < 1 || uses > 10000) throw new InviteError('bad-max-uses');

  const target = email ? normalizeEmail(email) : undefined;
  if (target && !isValidEmail(target)) throw new InviteError('bad-email');

  const token = crypto.randomBytes(32).toString('base64url');
  const invite = await CohortInvite.create({
    cohort: cohort._id,
    tokenHash: hashToken(token),
    email: target,
    expiresAt: expires,
    maxUses: uses,
    createdBy,
  });
  return { invite, token, url: inviteUrl(cohort.course, token) };
}

async function findByToken(token) {
  if (typeof token !== 'string' || token.length === 0 || token.length > MAX_TOKEN_LENGTH) return null;
  return CohortInvite.findOne({ tokenHash: hashToken(token) }).lean();
}

// Motivo por el que una invitación ya no sirve (null si sirve)
function unusableReason(invite, now) {
  if (invite.revokedAt) return 'revoked';
  if (invite.expiresAt <= now) return 'expired';
  if (invite.uses >= invite.maxUses) return 'exhausted';
  return null;
}

// Convierte la plaza pendiente de `email` en la del usuario. true si había una.
async function activatePending(cohortId, email, userId) {
  const pending = { email, status: 'pending', user: null };
  const { modifiedCount } = await Cohort.updateOne(
    { _id: cohortId, members: { $elemMatch: pending }, 'members.user': { $ne: userId } },
    { $set: { 'members.$[m].user': userId, 'members.$[m].status': 'active' } },
    { arrayFilters: [{ 'm.email': email, 'm.status': 'pending', 'm.user': null }] },
  );
  return modifiedCount > 0;
}

/**
 * Mete al usuario en la cohorte de la invitación (aunque su email no sea el de la invitación).
 * @returns {Promise<{ status: 'joined'|'already-member', courseId: string }>}
 * @throws {InviteError} invalid | expired | revoked | exhausted
 */
export async function redeemInvite({ token, user, now = new Date() }) {
  const invite = await findByToken(token);
  if (!invite) throw new InviteError('invalid');
  const cohort = await Cohort.findById(invite.cohort).select('course').lean();
  if (!cohort) throw new InviteError('invalid');

  const userId = user._id ?? user.id;
  const email = normalizeEmail(user.email);
  const result = (status) => ({ status, courseId: String(cohort.course) });

  const isMember = () => Cohort.exists({ _id: cohort._id, 'members.user': userId });

  // Ya es miembro: no se duplica ni se gasta uso (aunque la invitación ya no sirva)
  if (await isMember()) return result('already-member');

  // Una invitación que ya no sirve no sirve para nada: ni para entrar ni para activar plazas
  const reason = unusableReason(invite, now);
  if (reason) throw new InviteError(reason);

  // Gastar un uso, atómicamente (siempre: también al ocupar una plaza pendiente)
  const consumed = await CohortInvite.findOneAndUpdate(
    { _id: invite._id, revokedAt: null, expiresAt: { $gt: now }, $expr: { $lt: ['$uses', '$maxUses'] } },
    { $inc: { uses: 1 } },
  );
  if (!consumed) {
    // Un canje simultáneo del mismo usuario pudo gastar el último uso: entonces ya es miembro
    if (await isMember()) return result('already-member');
    const fresh = await CohortInvite.findById(invite._id).lean();
    throw new InviteError((fresh && unusableReason(fresh, now)) || 'exhausted');
  }

  // Solo una invitación nominativa ocupa la plaza pendiente de su email: el enlace llegó a ese email.
  // La coincidencia con el email de la cuenta no basta (con contraseña no está verificado).
  if (invite.email && (await activatePending(cohort._id, invite.email, userId))) return result('joined');

  const { modifiedCount } = await Cohort.updateOne(
    { _id: cohort._id, 'members.user': { $ne: userId } },
    { $push: { members: { user: userId, email, status: 'active', source: 'invite', addedAt: now, addedBy: invite.createdBy } } },
  );
  if (!modifiedCount) {
    // Otro canje simultáneo del mismo usuario llegó antes: se devuelve el uso
    await CohortInvite.updateOne({ _id: invite._id }, { $inc: { uses: -1 } });
    return result('already-member');
  }
  return result('joined');
}

/**
 * Lo mínimo para pintar la página de invitación antes de iniciar sesión.
 * @returns {Promise<{ valid: boolean, code?: string, courseId?: string, courseTitle?: string, cohortName?: string }>}
 */
export async function previewInvite(token, now = new Date()) {
  const invite = await findByToken(token);
  const cohort = invite && (await Cohort.findById(invite.cohort).select('name course').lean());
  if (!cohort) return { valid: false, code: 'invalid' };
  const course = await Course.findById(cohort.course).select('title titleEn').lean();
  const info = { courseId: String(cohort.course), courseTitle: course?.title || course?.titleEn || '', cohortName: cohort.name };
  const reason = unusableReason(invite, now);
  return reason ? { valid: false, code: reason, ...info } : { valid: true, ...info };
}
