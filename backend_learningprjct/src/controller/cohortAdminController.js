// Panel de administración de cohortes (todas las rutas: autenticar + soloAdmin).
import mongoose from 'mongoose';
import Cohort, { AFTER_END } from '../models/Cohort.js';
import CohortInvite from '../models/CohortInvite.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import { parseEmailList } from '../service/emailList.js';
import { createInvite, InviteError } from '../service/cohortInvites.js';
import { sendCohortInviteEmail } from '../service/mailService.js';

const NAME_MAX = 120;
const MEMBER_INVITE_TTL_DAYS = 14;

const badRequest = (res, error, extra = {}) => res.status(400).json({ error, ...extra });
const notFound = (res, what = 'Cohorte') => res.status(404).json({ error: `${what} no encontrada` });

const parseDate = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

// Valida los campos editables. Con `partial` solo los que llegan. Devuelve { data } o { error }.
function cohortInput(body = {}, { partial = false } = {}) {
  const data = {};
  if (!partial || body.name !== undefined) {
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name || name.length > NAME_MAX) return { error: `El nombre es obligatorio (máximo ${NAME_MAX} caracteres)` };
    data.name = name;
  }
  for (const field of ['startsAt', 'endsAt']) {
    if (partial && body[field] === undefined) continue;
    const date = parseDate(body[field]);
    if (!date) return { error: 'Las fechas de inicio y fin son obligatorias y deben ser válidas' };
    data[field] = date;
  }
  if (body.afterEnd !== undefined || !partial) {
    const afterEnd = body.afterEnd ?? 'readonly';
    if (!AFTER_END.includes(afterEnd)) return { error: 'Al terminar: elige «solo lectura» o «retirar acceso»' };
    data.afterEnd = afterEnd;
  }
  return { data };
}

const counts = (members = []) => ({
  active: members.filter((m) => m.status === 'active').length,
  pending: members.filter((m) => m.status === 'pending').length,
});

const serializeCohort = (cohort) => ({
  _id: cohort._id,
  name: cohort.name,
  course: cohort.course,
  startsAt: cohort.startsAt,
  endsAt: cohort.endsAt,
  afterEnd: cohort.afterEnd,
  createdAt: cohort.createdAt,
  counts: counts(cohort.members),
  members: (cohort.members ?? []).map((m) => ({
    _id: m._id,
    email: m.email,
    status: m.status,
    source: m.source,
    addedAt: m.addedAt,
    user: m.user && typeof m.user === 'object' && m.user.name !== undefined ? { _id: m.user._id, name: m.user.name } : m.user ? { _id: m.user } : null,
  })),
});

const inviteStatus = (invite, now = new Date()) => {
  if (invite.revokedAt) return 'revoked';
  if (invite.expiresAt <= now) return 'expired';
  if (invite.uses >= invite.maxUses) return 'exhausted';
  return 'active';
};

// Nunca sale el tokenHash
const serializeInvite = (invite) => ({
  _id: invite._id,
  email: invite.email ?? null,
  expiresAt: invite.expiresAt,
  maxUses: invite.maxUses,
  uses: invite.uses,
  revokedAt: invite.revokedAt ?? null,
  createdAt: invite.createdAt,
  kind: invite.createdBy ? 'link' : 'claim', // 'claim' = enlace que manda el sistema al entrar con contraseña
  status: inviteStatus(invite),
});

const loadCohort = (id) => (mongoose.isValidObjectId(id) ? Cohort.findById(id) : null);

const populated = (id) => Cohort.findById(id).populate('members.user', 'name').lean();

// ============= Cohortes =============

/** @route GET /api/cohorts?course=:courseId */
export const listarCohortes = async (req, res, next) => {
  try {
    const { course } = req.query;
    if (!mongoose.isValidObjectId(course)) return badRequest(res, 'Indica el curso');
    const cohorts = await Cohort.find({ course }).sort({ startsAt: -1 }).populate('members.user', 'name').lean();
    return res.json(cohorts.map(serializeCohort));
  } catch (err) {
    return next(err);
  }
};

/** @route POST /api/cohorts  { course, name, startsAt, endsAt, afterEnd } */
export const crearCohorte = async (req, res, next) => {
  try {
    const { data, error } = cohortInput(req.body);
    if (error) return badRequest(res, error);
    if (data.endsAt <= data.startsAt) return badRequest(res, 'La fecha de fin debe ser posterior a la de inicio');
    const course = mongoose.isValidObjectId(req.body.course) ? await Course.exists({ _id: req.body.course }) : null;
    if (!course) return badRequest(res, 'El curso no existe');

    const cohort = await Cohort.create({ ...data, course: course._id });
    await Course.updateOne({ _id: course._id }, { $addToSet: { cohorts: cohort._id } });
    return res.status(201).json(serializeCohort(cohort.toObject()));
  } catch (err) {
    return next(err);
  }
};

/** @route PUT /api/cohorts/:id  { name?, startsAt?, endsAt?, afterEnd? } */
export const actualizarCohorte = async (req, res, next) => {
  try {
    const cohort = await loadCohort(req.params.id);
    if (!cohort) return notFound(res);
    const { data, error } = cohortInput(req.body, { partial: true });
    if (error) return badRequest(res, error);
    cohort.set(data);
    if (cohort.endsAt <= cohort.startsAt) return badRequest(res, 'La fecha de fin debe ser posterior a la de inicio');
    await cohort.save();
    return res.json(serializeCohort(await populated(cohort._id)));
  } catch (err) {
    return next(err);
  }
};

/** @route DELETE /api/cohorts/:id[?force=1] — con miembros activos exige force */
export const eliminarCohorte = async (req, res, next) => {
  try {
    const cohort = await loadCohort(req.params.id);
    if (!cohort) return notFound(res);
    const { active } = counts(cohort.members);
    if (active > 0 && req.query.force !== '1') {
      return res.status(409).json({ error: `La cohorte tiene ${active} miembro(s) activo(s): perderán el acceso.`, active });
    }
    await CohortInvite.deleteMany({ cohort: cohort._id });
    await Course.updateOne({ _id: cohort.course }, { $pull: { cohorts: cohort._id } });
    await cohort.deleteOne();
    return res.json({ message: 'Cohorte eliminada' });
  } catch (err) {
    return next(err);
  }
};

/** @route PUT /api/courses/:id/access  { accessMode: 'public'|'private' } */
export const cambiarModoAcceso = async (req, res, next) => {
  try {
    const { accessMode } = req.body ?? {};
    if (!['public', 'private'].includes(accessMode)) return badRequest(res, 'Modo de acceso no válido');
    const course = mongoose.isValidObjectId(req.params.id)
      ? await Course.findByIdAndUpdate(req.params.id, { $set: { accessMode } }, { new: true }).select('accessMode cohorts').lean()
      : null;
    if (!course) return res.status(404).json({ error: 'Curso no encontrado' });
    return res.json({ _id: course._id, accessMode: course.accessMode, cohorts: course.cohorts });
  } catch (err) {
    return next(err);
  }
};

// ============= Miembros =============

async function sendMemberInvite(cohort, email, adminId) {
  const expiresAt = new Date(Date.now() + MEMBER_INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);
  const { url } = await createInvite({ cohortId: cohort._id, createdBy: adminId, email, maxUses: 1, expiresAt });
  const course = await Course.findById(cohort.course).select('title titleEn').lean();
  await sendCohortInviteEmail({ to: email, url, courseTitle: course?.title || course?.titleEn, cohortName: cohort.name, startsAt: cohort.startsAt, expiresAt });
}

/**
 * Alta masiva por email. Todos entran como 'pending': la plaza la activa quien controla el email
 * (enlace del correo, o Google con email verificado). Así un email mal escrito o una cuenta registrada
 * con el email de otro no se llevan la plaza.
 * @route POST /api/cohorts/:id/members  { emails: string, sendEmail?: boolean }
 */
export const anadirMiembros = async (req, res, next) => {
  try {
    const cohort = await loadCohort(req.params.id);
    if (!cohort) return notFound(res);
    const { valid, invalid } = parseEmailList(req.body?.emails);
    const summary = { added: [], existing: [], invalid, emailed: [], emailFailed: [] };
    if (valid.length === 0) return badRequest(res, 'No hay ningún email válido', { summary });

    // Ya presentes: por email de la plaza o por el email de la cuenta vinculada
    const linked = await User.find({ _id: { $in: cohort.members.map((m) => m.user).filter(Boolean) } }).select('email').lean();
    const present = new Set([...cohort.members.map((m) => m.email), ...linked.map((u) => u.email)]);

    for (const email of valid) {
      if (present.has(email)) {
        summary.existing.push(email);
        continue;
      }
      summary.added.push(email);
      present.add(email);
    }
    if (summary.added.length) {
      const now = new Date();
      // $push con filtro: si otra petición añadió el mismo email entre medias, no se duplica
      for (const email of summary.added) {
        await Cohort.updateOne(
          { _id: cohort._id, 'members.email': { $ne: email } },
          { $push: { members: { email, status: 'pending', user: null, source: 'email', addedAt: now, addedBy: req.user._id } } },
        );
      }
    }

    if (req.body?.sendEmail !== false) {
      for (const email of summary.added) {
        try {
          await sendMemberInvite(cohort, email, req.user._id);
          summary.emailed.push(email);
        } catch (err) {
          console.error(`No se pudo enviar la invitación a ${email}:`, err.message);
          summary.emailFailed.push(email);
        }
      }
    }

    return res.json({ summary, cohort: serializeCohort(await populated(cohort._id)) });
  } catch (err) {
    return next(err);
  }
};

/** @route DELETE /api/cohorts/:id/members/:memberId */
export const quitarMiembro = async (req, res, next) => {
  try {
    const { id, memberId } = req.params;
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(memberId)) return notFound(res, 'Miembro');
    // Se filtra por el miembro: con timestamps, updatedAt cuenta como cambio aunque $pull no quite nada
    const { matchedCount } = await Cohort.updateOne({ _id: id, 'members._id': memberId }, { $pull: { members: { _id: memberId } } });
    if (!matchedCount) return res.status(404).json({ error: 'Miembro no encontrado' });
    return res.json({ message: 'Miembro quitado' });
  } catch (err) {
    return next(err);
  }
};

// ============= Invitaciones =============

const INVITE_INPUT_ERRORS = {
  'bad-expiry': 'La caducidad debe ser una fecha futura',
  'bad-max-uses': 'El número de usos debe ser un entero entre 1 y 10000',
  'bad-email': 'Email no válido',
};

/** @route GET /api/cohorts/:id/invites */
export const listarInvitaciones = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);
    const invites = await CohortInvite.find({ cohort: req.params.id }).select('-tokenHash').sort({ createdAt: -1 }).lean();
    return res.json(invites.map(serializeInvite));
  } catch (err) {
    return next(err);
  }
};

/**
 * La URL (con el token) solo se devuelve aquí: en la base de datos no está, no se puede volver a ver.
 * @route POST /api/cohorts/:id/invites  { email?, maxUses?, expiresAt?, send? }
 */
export const crearInvitacion = async (req, res, next) => {
  try {
    const cohort = await loadCohort(req.params.id);
    if (!cohort) return notFound(res);
    const { email, maxUses = 1, expiresAt, send = false } = req.body ?? {};
    let created;
    try {
      created = await createInvite({ cohortId: cohort._id, createdBy: req.user._id, email: email || undefined, maxUses, expiresAt: expiresAt || undefined });
    } catch (err) {
      if (err instanceof InviteError && INVITE_INPUT_ERRORS[err.code]) return badRequest(res, INVITE_INPUT_ERRORS[err.code]);
      throw err;
    }

    let emailed = false;
    if (send && created.invite.email) {
      try {
        const course = await Course.findById(cohort.course).select('title titleEn').lean();
        await sendCohortInviteEmail({
          to: created.invite.email,
          url: created.url,
          courseTitle: course?.title || course?.titleEn,
          cohortName: cohort.name,
          startsAt: cohort.startsAt,
          expiresAt: created.invite.expiresAt,
        });
        emailed = true;
      } catch (err) {
        console.error('No se pudo enviar la invitación:', err.message);
      }
    }
    res.set('Cache-Control', 'no-store');
    return res.status(201).json({ invite: serializeInvite(created.invite.toObject()), url: created.url, emailed });
  } catch (err) {
    return next(err);
  }
};

/** @route POST /api/cohorts/:id/invites/:inviteId/revoke */
export const revocarInvitacion = async (req, res, next) => {
  try {
    const { id, inviteId } = req.params;
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(inviteId)) return notFound(res, 'Invitación');
    const invite = await CohortInvite.findOneAndUpdate(
      { _id: inviteId, cohort: id },
      { $set: { revokedAt: new Date() } },
      { new: true },
    ).select('-tokenHash').lean();
    if (!invite) return res.status(404).json({ error: 'Invitación no encontrada' });
    return res.json(serializeInvite(invite));
  } catch (err) {
    return next(err);
  }
};
