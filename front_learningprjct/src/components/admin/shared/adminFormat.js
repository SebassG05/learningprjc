// Formato común del panel de administración: nombres con fallback, iniciales y fechas.

export const DELETED_STUDENT = 'Alumno eliminado';
export const DELETED_COURSE = 'Curso eliminado';
export const DELETED_EXERCISE = 'Ejercicio eliminado';

// populate() devuelve null cuando el documento referenciado ya no existe
export const studentName = (user) => user?.name?.trim() || user?.email || DELETED_STUDENT;
export const courseName = (course) => course?.title?.trim() || course?.titleEn?.trim() || DELETED_COURSE;
export const exerciseName = (exercise) => exercise?.titulo?.trim() || DELETED_EXERCISE;
export const isDeleted = (ref) => !ref || (typeof ref === 'object' && !ref.name && !ref.email && !ref.title && !ref.titleEn && !ref.titulo);

// Hasta dos iniciales; sin nombre, la primera letra del email
export function initials(name, email) {
  const words = (name || '').trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (email || '?')[0].toUpperCase();
}

const UNITS = [
  ['year', 365 * 864e5],
  ['month', 30 * 864e5],
  ['week', 7 * 864e5],
  ['day', 864e5],
  ['hour', 36e5],
  ['minute', 6e4],
];
const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

// «hace 3 días», «ayer», «hace 2 horas»; menos de un minuto: «ahora»
export function relativeTime(date, now = Date.now()) {
  const t = new Date(date).getTime();
  if (!Number.isFinite(t)) return '';
  const diff = t - now;
  for (const [unit, ms] of UNITS) {
    if (Math.abs(diff) >= ms) return rtf.format(Math.round(diff / ms), unit);
  }
  return 'ahora';
}

const absFmt = new Intl.DateTimeFormat('es-ES', { dateStyle: 'long', timeStyle: 'short' });
export function absoluteDate(date) {
  const d = new Date(date);
  return Number.isFinite(d.getTime()) ? absFmt.format(d) : '';
}
