// Profesores de un curso (Course.profesores): alta por correo, enlace de un solo uso, reenvío, baja y
// vinculación con una cuenta.
// - El token (32 bytes aleatorios, base64url) solo existe en claro en el correo y en la respuesta de
//   alta/reenvío; en la base de datos se guarda su SHA-256. Va en el FRAGMENTO de la URL (#token=…):
//   el navegador no lo envía al servidor, así que no llega a logs ni al Referer.
// - Canjear marca la fila como activa con un único update condicional; el hash pasa de `tokenHash` a
//   `redeemedTokenHash`, así un segundo intento responde «usado» y una fila borrada responde «inválido».
// - `profesores` es select:false: toda lectura pide '+profesores'.
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import { TEACHERS_MAX } from '../config/courseCatalog.js';
import { isValidEmail, normalizeEmail } from '../utils/email.js';
import { frontendUrl, hashToken } from './cohortInvites.js';
import { sendTeacherInviteEmail, sendTeacherLinkedEmail } from './mailService.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const TOKEN_TTL_DAYS = 14;
const MAX_TOKEN_LENGTH = 200;

const STATUS = {
  'bad-email': 400,
  'not-found': 404,
  invalid: 404,
  duplicate: 409,
  limit: 409,
  'already-linked': 409,
  'already-teacher': 409,
  expired: 410,
  used: 410,
  'mail-failed': 502,
};

export class TeacherError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
    this.status = STATUS[code] ?? 400;
  }
}

// Lo único que sale del servicio de una fila: nunca los hashes del token ni nada interno
export const publicTeacher = (row) => ({
  _id: row._id,
  email: row.email,
  status: row.status,
  addedAt: row.addedAt,
  lastSentAt: row.lastSentAt,
  tokenExpiresAt: row.tokenExpiresAt,
  linkedAt: row.linkedAt,
});

// La fila ya está guardada: si el correo falla se avisa con un código propio y se puede reenviar
async function sendInvite(args) {
  try {
    await sendTeacherInviteEmail(args);
  } catch (err) {
    console.error('No se pudo enviar el correo de profesor:', err.message);
    throw new TeacherError('mail-failed');
  }
}

const courseTitle = (course) => course?.title || course?.titleEn;
const teacherUrl = (token) => `${frontendUrl()}/profesor/invitacion#token=${encodeURIComponent(token)}`;
const newToken = (now) => {
  const token = crypto.randomBytes(32).toString('base64url');
  return { token, tokenHash: hashToken(token), tokenExpiresAt: new Date(now.getTime() + TOKEN_TTL_DAYS * DAY_MS) };
};

/** 'laura.martin@uco.es' → 'l•••@uco.es' (no revela el correo completo en la previsualización) */
export function maskEmail(value) {
  const email = normalizeEmail(value);
  const at = email.lastIndexOf('@');
  if (at < 1) return '•••';
  return `${email[0]}•••${email.slice(at)}`;
}

/**
 * Añade un profesor pendiente y le envía el enlace. El alta es un único update condicionado (correo no
 * repetido y menos de TEACHERS_MAX), así que dos altas a la vez no pueden colarse.
 * @returns {Promise<{ teacher, url }>}
 */
export async function addTeacher({ courseId, email, addedBy, now = new Date() }) {
  const target = normalizeEmail(email);
  if (!isValidEmail(target)) throw new TeacherError('bad-email');
  if (!mongoose.isValidObjectId(courseId)) throw new TeacherError('not-found');

  const { token, tokenHash, tokenExpiresAt } = newToken(now);
  const teacher = {
    _id: new mongoose.Types.ObjectId(),
    email: target,
    status: 'pending',
    userId: null,
    tokenHash,
    redeemedTokenHash: null,
    tokenExpiresAt,
    lastSentAt: now,
    addedBy,
    addedAt: now,
    linkedAt: null,
  };
  const { modifiedCount } = await Course.updateOne(
    {
      _id: courseId,
      'profesores.email': { $ne: target },
      $expr: { $lt: [{ $size: { $ifNull: ['$profesores', []] } }, TEACHERS_MAX] },
    },
    { $push: { profesores: teacher } },
  );

  if (!modifiedCount) {
    // Para decir el motivo se relee: no condiciona nada, solo explica el rechazo
    const course = await Course.findById(courseId).select('+profesores').lean();
    if (!course) throw new TeacherError('not-found');
    if ((course.profesores ?? []).some((p) => p.email === target)) throw new TeacherError('duplicate');
    throw new TeacherError('limit');
  }

  const course = await Course.findById(courseId).select('title titleEn').lean();
  const url = teacherUrl(token);
  await sendInvite({ to: target, url, courseTitle: courseTitle(course), expiresAt: tokenExpiresAt });
  return { teacher: publicTeacher(teacher), url };
}

/** Nuevo enlace para un profesor pendiente; el anterior deja de valer. @returns {Promise<{ teacher, url }>} */
export async function resendTeacher({ courseId, teacherId, now = new Date() }) {
  if (!mongoose.isValidObjectId(courseId) || !mongoose.isValidObjectId(teacherId)) throw new TeacherError('not-found');

  const { token, tokenHash, tokenExpiresAt } = newToken(now);
  const course = await Course.findOneAndUpdate(
    { _id: courseId, profesores: { $elemMatch: { _id: teacherId, status: 'pending' } } },
    { $set: { 'profesores.$[t].tokenHash': tokenHash, 'profesores.$[t].tokenExpiresAt': tokenExpiresAt, 'profesores.$[t].lastSentAt': now } },
    { arrayFilters: [{ 't._id': new mongoose.Types.ObjectId(teacherId), 't.status': 'pending' }], new: true },
  ).select('title titleEn +profesores').lean();

  if (!course) {
    const existing = await Course.findOne({ _id: courseId, 'profesores._id': teacherId }).select('_id').lean();
    throw new TeacherError(existing ? 'already-linked' : 'not-found');
  }
  const row = course.profesores.find((p) => String(p._id) === String(teacherId));
  const url = teacherUrl(token);
  await sendInvite({ to: row.email, url, courseTitle: courseTitle(course), expiresAt: tokenExpiresAt });
  return { teacher: publicTeacher(row), url };
}

/** Quita al profesor (pendiente o activo). Con la fila desaparece su tokenHash: el enlace da «inválido». */
export async function removeTeacher({ courseId, teacherId }) {
  if (!mongoose.isValidObjectId(courseId) || !mongoose.isValidObjectId(teacherId)) throw new TeacherError('not-found');
  const { modifiedCount } = await Course.updateOne(
    { _id: courseId, 'profesores._id': teacherId },
    { $pull: { profesores: { _id: teacherId } } },
  );
  if (!modifiedCount) throw new TeacherError('not-found');
}

// Explica por qué un token no se puede canjear (o devuelve el curso y la fila si todavía vale)
async function lookupToken(token, now) {
  if (typeof token !== 'string' || token.length === 0 || token.length > MAX_TOKEN_LENGTH) throw new TeacherError('invalid');
  const hash = hashToken(token);
  const course = await Course.findOne({ $or: [{ 'profesores.tokenHash': hash }, { 'profesores.redeemedTokenHash': hash }] })
    .select('title titleEn +profesores')
    .lean();
  const row = course?.profesores.find((p) => p.tokenHash === hash || p.redeemedTokenHash === hash);
  if (!row) throw new TeacherError('invalid');
  if (row.redeemedTokenHash === hash) throw new TeacherError('used');
  if (row.status !== 'pending' || !row.tokenExpiresAt || row.tokenExpiresAt <= now) throw new TeacherError('expired');
  return { course, row };
}

/** @returns {Promise<{ courseId, courseTitle, emailMasked }>} */
export async function previewTeacherInvite(token, now = new Date()) {
  const { course, row } = await lookupToken(token, now);
  return { courseId: course._id, courseTitle: courseTitle(course), emailMasked: maskEmail(row.email) };
}

/**
 * Canjea el enlace con la cuenta que ha entrado. Si su correo no es el invitado se concede igual
 * (`mismatch: true`) y se avisa a la dirección invitada de en qué cuenta quedó.
 * @returns {Promise<{ courseId, mismatch: boolean }>}
 */
export async function redeemTeacherInvite({ token, user, now = new Date() }) {
  const { course: found } = await lookupToken(token, now); // invalid / used / expired
  const hash = hashToken(token);

  const course = await Course.findOneAndUpdate(
    {
      _id: found._id,
      profesores: { $elemMatch: { tokenHash: hash, status: 'pending', tokenExpiresAt: { $gt: now } } },
      // Ya es profesor activo de este curso con otra fila: no se duplica
      $nor: [{ profesores: { $elemMatch: { userId: user._id, status: 'active' } } }],
    },
    {
      $set: {
        'profesores.$[r].status': 'active',
        'profesores.$[r].userId': user._id,
        'profesores.$[r].linkedAt': now,
        'profesores.$[r].tokenHash': null,
        'profesores.$[r].redeemedTokenHash': hash,
      },
    },
    { arrayFilters: [{ 'r.tokenHash': hash, 'r.status': 'pending', 'r.tokenExpiresAt': { $gt: now } }], new: true },
  ).select('title titleEn +profesores').lean();

  if (!course) {
    // No se pudo: otro canje se adelantó, venció justo ahora o ya era profesor con otra fila
    const again = await Course.findById(found._id).select('+profesores').lean();
    if (again?.profesores.some((p) => String(p.userId) === String(user._id) && p.status === 'active')) throw new TeacherError('already-teacher');
    await lookupToken(token, now);
    throw new TeacherError('used');
  }

  const row = course.profesores.find((p) => p.redeemedTokenHash === hash);
  const mismatch = normalizeEmail(user.email) !== row.email;
  if (mismatch) {
    // El canje ya está hecho: un fallo del correo no debe tirarlo
    try {
      await sendTeacherLinkedEmail({ to: row.email, courseTitle: courseTitle(course), accountMasked: maskEmail(user.email) });
    } catch (err) {
      console.error('No se pudo avisar al profesor invitado de la vinculación:', err.message);
    }
  }
  return { courseId: course._id, mismatch };
}

/**
 * Activa todas las filas pendientes con el correo de la cuenta, en todos los cursos, sin enlace.
 * Solo con el correo verificado (Google con email_verified): con contraseña cualquiera podría
 * registrarse con el correo de un invitado y quedarse el acceso.
 * @returns {Promise<number>} filas activadas
 */
export async function claimTeacherSlotsByGoogle(user, { verified = false, now = new Date() } = {}) {
  const email = normalizeEmail(user?.email);
  if (verified !== true || !user?._id || !isValidEmail(email)) return 0;
  const { modifiedCount } = await Course.updateMany(
    {
      profesores: { $elemMatch: { email, status: 'pending' } },
      'profesores.userId': { $ne: user._id }, // si ya es profesor activo de ese curso, no se toca
    },
    {
      $set: {
        'profesores.$[r].status': 'active',
        'profesores.$[r].userId': user._id,
        'profesores.$[r].linkedAt': now,
        'profesores.$[r].tokenHash': null,
      },
    },
    { arrayFilters: [{ 'r.email': email, 'r.status': 'pending' }] },
  );
  return modifiedCount;
}

// Para los controladores de login: nunca rompe el inicio de sesión
export async function claimTeacherSlotsSafely(user, options) {
  try {
    return await claimTeacherSlotsByGoogle(user, options);
  } catch (err) {
    console.error('No se pudieron revisar los accesos de profesor pendientes:', err.message);
    return 0;
  }
}
