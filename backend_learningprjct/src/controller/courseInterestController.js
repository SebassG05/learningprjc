import mongoose from 'mongoose';
import Course from '../models/Course.js';
import CourseInterest from '../models/CourseInterest.js';
import User from '../models/User.js';
import { isPrivate } from '../service/courseAccess.js';
import { isValidEmail, normalizeEmail } from '../utils/email.js';

const loadPrivateCourse = async (id) => {
  const course = mongoose.isValidObjectId(id) ? await Course.findById(id).select('accessMode').lean() : null;
  return course && isPrivate(course) ? course : null;
};

/**
 * «Avísame de la próxima edición» (solo cursos privados). Con sesión se usa el email de la cuenta.
 * Idempotente: apuntarse dos veces no duplica.
 * @route POST /api/courses/:id/interes  { email? }
 * @access Public (optionalAuth + rate limit)
 */
export const apuntarInteresado = async (req, res, next) => {
  try {
    const course = await loadPrivateCourse(req.params.id);
    if (!course) return res.status(404).json({ error: 'Curso no encontrado' });

    const account = req.user?.id && mongoose.isValidObjectId(req.user.id)
      ? await User.findById(req.user.id).select('email').lean()
      : null;
    const email = normalizeEmail(account?.email ?? req.body?.email);
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Escribe un email válido' });

    await CourseInterest.updateOne(
      { course: course._id, email },
      { $setOnInsert: { course: course._id, email, ...(account && { user: account._id }) } },
      { upsert: true },
    );
    return res.status(201).json({ ok: true });
  } catch (err) {
    return next(err);
  }
};

/**
 * @route GET /api/courses/:id/interes
 * @access Private (admin)
 */
export const listarInteresados = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Curso no encontrado' });
    const rows = await CourseInterest.find({ course: req.params.id }).sort({ createdAt: -1 }).select('email user createdAt').lean();
    return res.json(rows.map(({ _id, email, user, createdAt }) => ({ _id, email, hasAccount: Boolean(user), createdAt })));
  } catch (err) {
    return next(err);
  }
};
