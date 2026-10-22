// Punto donde se quedó el alumno en el vídeo completo de un curso. Solo es una comodidad: si el
// navegador bloquea localStorage o el valor no es válido, el vídeo empieza desde el principio.
const MIN_SECONDS = 5; // antes de esto no merece la pena reanudar
const TAIL_SECONDS = 10; // tan cerca del final se considera visto

export const resumeKey = (courseId) => `video_pos_v1_${courseId}`;

export function readResume(courseId, duration) {
  let t;
  try {
    t = Number.parseFloat(localStorage.getItem(resumeKey(courseId)));
  } catch {
    return 0;
  }
  if (!Number.isFinite(t) || t < MIN_SECONDS) return 0;
  if (Number.isFinite(duration) && t > duration - TAIL_SECONDS) return 0;
  return t;
}

export function saveResume(courseId, seconds) {
  try {
    localStorage.setItem(resumeKey(courseId), String(Math.round(seconds * 10) / 10));
  } catch {
    /* sin almacenamiento: no se recuerda */
  }
}

export function clearResume(courseId) {
  try {
    localStorage.removeItem(resumeKey(courseId));
  } catch {
    /* sin almacenamiento */
  }
}
