// Profesores de un curso: gestión (admin), invitación por enlace de un solo uso y «mis cursos».
// Nunca se devuelven hashes ni la URL de un solo uso: el correo es la prueba de propiedad.
import { validationResult } from 'express-validator';
import { contarDudasPorCurso } from './dudaController.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import {
  TeacherError, addTeacher, publicTeacher, previewTeacherInvite, redeemTeacherInvite, removeTeacher, resendTeacher,
} from '../service/courseTeachers.js';

const MESSAGES = {
  'bad-email': 'El correo no es válido.',
  'not-found': 'No se ha encontrado el profesor o el curso.',
  invalid: 'El enlace no es válido.',
  duplicate: 'Ese correo ya es profesor de este curso.',
  limit: 'Se ha alcanzado el máximo de profesores del curso.',
  'already-linked': 'Ese profesor ya tiene una cuenta vinculada.',
  'already-teacher': 'Ya eres profesor de este curso.',
  expired: 'El enlace ha caducado. Pide que te lo reenvíen.',
  used: 'El enlace ya se ha usado.',
  'mail-failed': 'Se ha guardado, pero no se ha podido enviar el correo. Prueba a reenviarlo.',
};

export const noStore = (req, res, next) => {
  res.set('Cache-Control', 'private, no-store');
  next();
};

function fail(res, next, err) {
  if (err instanceof TeacherError) {
    return res.status(err.status).json({ error: MESSAGES[err.code] ?? 'No se ha podido completar la operación.', code: err.code });
  }
  return next(err);
}

// Responde 400 si express-validator ha encontrado errores
function invalidInput(req, res) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return false;
  res.status(400).json({ error: 'Datos no válidos.', code: 'bad-request' });
  return true;
}

export async function listarProfesores(req, res, next) {
  try {
    if (invalidInput(req, res)) return;
    const course = await Course.findById(req.params.id).select('+profesores').lean();
    if (!course) return res.status(404).json({ error: MESSAGES['not-found'], code: 'not-found' });
    const rows = course.profesores ?? [];
    const ids = rows.map((r) => r.userId).filter(Boolean);
    const users = ids.length ? await User.find({ _id: { $in: ids } }).select('name email').lean() : [];
    const byId = new Map(users.map((u) => [String(u._id), u]));
    res.json(rows.map((row) => {
      const u = row.userId ? byId.get(String(row.userId)) : null;
      return { ...publicTeacher(row), cuenta: u ? { name: u.name, email: u.email } : null };
    }));
  } catch (err) {
    fail(res, next, err);
  }
}

export async function altaProfesor(req, res, next) {
  try {
    if (invalidInput(req, res)) return;
    const { teacher } = await addTeacher({ courseId: req.params.id, email: req.body.email, addedBy: req.user._id });
    res.status(201).json(publicTeacher(teacher));
  } catch (err) {
    fail(res, next, err);
  }
}

export async function reenviarProfesor(req, res, next) {
  try {
    if (invalidInput(req, res)) return;
    const { teacher } = await resendTeacher({ courseId: req.params.id, teacherId: req.params.profesorId });
    res.json(publicTeacher(teacher));
  } catch (err) {
    fail(res, next, err);
  }
}

export async function bajaProfesor(req, res, next) {
  try {
    if (invalidInput(req, res)) return;
    await removeTeacher({ courseId: req.params.id, teacherId: req.params.profesorId });
    res.json({ ok: true });
  } catch (err) {
    fail(res, next, err);
  }
}

export async function vistaInvitacion(req, res, next) {
  try {
    if (invalidInput(req, res)) return;
    res.json(await previewTeacherInvite(req.body.token));
  } catch (err) {
    fail(res, next, err);
  }
}

export async function canjearInvitacion(req, res, next) {
  try {
    if (invalidInput(req, res)) return;
    // authenticateJWT solo trae el id del token: se carga la cuenta (y que siga activa)
    const user = await User.findById(req.user.id).select('email activo');
    if (!user || user.activo === false) return res.status(401).json({ error: 'No autorizado' });
    res.json(await redeemTeacherInvite({ token: req.body.token, user }));
  } catch (err) {
    fail(res, next, err);
  }
}

export async function misCursosProfesor(req, res, next) {
  try {
    const courses = await Course.find({ profesores: { $elemMatch: { userId: req.user.id, status: 'active' } } })
      .select('title titleEn').sort({ title: 1 }).lean();
    const counts = await contarDudasPorCurso(courses.map((c) => c._id));
    res.json(courses.map((c) => ({
      _id: c._id,
      title: c.title,
      titleEn: c.titleEn ?? null,
      abiertas: counts.get(String(c._id))?.abiertas ?? 0,
      reportadas: counts.get(String(c._id))?.reportadas ?? 0,
    })));
  } catch (err) {
    fail(res, next, err);
  }
}
