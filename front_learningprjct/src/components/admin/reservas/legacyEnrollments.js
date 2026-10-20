import { ApiError, fetchEnrollments } from '../../../lib/adminApi';
import { legacyRows } from './reservasQuery';

// ¿El backend aún no tiene /api/users/admin/enrollments? (versión anterior: responde 404)
export const isMissingEndpoint = (err) => err instanceof ApiError && err.status === 404;

// Todas las inscripciones con el endpoint por curso (backend anterior): una petición por curso
export async function loadLegacyEnrollments(courses, signal) {
  const perCourse = await Promise.all(
    courses.map((course) => fetchEnrollments(course._id, signal).then((r) => ({ course, enrollments: r.enrollments ?? [] })))
  );
  return legacyRows(perCourse);
}
