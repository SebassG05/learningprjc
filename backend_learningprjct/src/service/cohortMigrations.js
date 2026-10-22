// Migraciones de datos de las cohortes. Los scripts de src/scripts solo leen argumentos y llaman aquí.
// Todas: simulacro por defecto (apply=false → no escriben), idempotentes y con informe de lo hecho.
import mongoose from 'mongoose';
import Cohort from '../models/Cohort.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import UserProgress from '../models/UserProgress.js';
import { parseEmailList } from './emailList.js';

/**
 * Los cursos anteriores a las cohortes no tienen accessMode: se marcan 'public' (el comportamiento de
 * siempre). Mongoose ya los lee como públicos; esto deja el dato explícito en la base de datos.
 * @returns {Promise<{ pending: number, updated: number }>}
 */
export async function migrateAccessMode({ apply = false } = {}) {
  const filter = { accessMode: { $exists: false } };
  const pending = await Course.collection.countDocuments(filter);
  if (!apply || pending === 0) return { pending, updated: 0 };
  const { modifiedCount } = await Course.collection.updateMany(filter, { $set: { accessMode: 'public' } });
  await Course.collection.updateMany({ cohorts: { $exists: false } }, { $set: { cohorts: [] } });
  return { pending, updated: modifiedCount };
}

/**
 * Crea (o actualiza, si ya existe con ese nombre) la cohorte de un curso, la enlaza, hace privado el
 * curso y, opcionalmente, añade emails como miembros pendientes. Informa de las inscripciones que
 * quedan fuera de toda cohorte (perderán el acceso) sin tocarlas.
 */
export async function setupCourseCohort({ courseId, name, startsAt, endsAt, afterEnd = 'readonly', emails = '', apply = false }) {
  if (!mongoose.isValidObjectId(courseId)) throw new Error(`Id de curso no válido: ${courseId}`);
  const course = await Course.findById(courseId).select('title accessMode cohorts').lean();
  if (!course) throw new Error(`El curso ${courseId} no existe`);
  if (!(startsAt instanceof Date) || !(endsAt instanceof Date) || Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    throw new Error('Fechas no válidas');
  }
  if (endsAt <= startsAt) throw new Error('La fecha de fin debe ser posterior a la de inicio');

  const existing = await Cohort.findOne({ course: course._id, name });
  const { valid, invalid } = parseEmailList(emails);
  const present = new Set(existing?.members.map((m) => m.email) ?? []);
  const members = { added: valid.filter((e) => !present.has(e)), existing: valid.filter((e) => present.has(e)), invalid };

  const report = {
    course: { _id: String(course._id), title: course.title },
    cohort: { action: existing ? 'update' : 'create', name, startsAt, endsAt, afterEnd },
    accessMode: { from: course.accessMode ?? 'public', to: 'private' },
    members,
    enrollmentsWithoutCohort: [],
  };

  if (apply) {
    const cohort = existing ?? new Cohort({ course: course._id, name });
    cohort.set({ startsAt, endsAt, afterEnd });
    for (const email of members.added) cohort.members.push({ email, status: 'pending', user: null, source: 'email' });
    await cohort.save();
    await Course.updateOne({ _id: course._id }, { $set: { accessMode: 'private' }, $addToSet: { cohorts: cohort._id } });
    report.cohort._id = String(cohort._id);
  }

  // Inscritos sin plaza en ninguna cohorte del curso (tras aplicar, si se aplicó)
  const cohorts = await Cohort.find({ course: course._id }).select('members.user').lean();
  const inCohort = new Set(cohorts.flatMap((c) => c.members.map((m) => String(m.user))).filter((id) => id !== 'null'));
  const enrolled = await UserProgress.find({ courseId: course._id }).select('userId').lean();
  const outside = enrolled.map((e) => e.userId).filter((id) => !inCohort.has(String(id)));
  const users = await User.find({ _id: { $in: outside } }).select('email').lean();
  report.enrollmentsWithoutCohort = users.map((u) => u.email).sort();

  return report;
}

/** Vuelta atrás: el curso vuelve a público. Las cohortes se conservan (no dan acceso mientras sea público). */
export async function rollbackCourseCohort({ courseId, apply = false }) {
  if (!mongoose.isValidObjectId(courseId)) throw new Error(`Id de curso no válido: ${courseId}`);
  const course = await Course.findById(courseId).select('title accessMode').lean();
  if (!course) throw new Error(`El curso ${courseId} no existe`);
  if (apply) await Course.updateOne({ _id: course._id }, { $set: { accessMode: 'public' } });
  return { course: { _id: String(course._id), title: course.title }, accessMode: { from: course.accessMode ?? 'public', to: 'public' } };
}
