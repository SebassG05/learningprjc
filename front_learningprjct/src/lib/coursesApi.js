// Peticiones del catálogo de cursos.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8547';

// Error con el mensaje del backend (si lo hay) y el código HTTP
export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

const getJson = async (url, init) => {
  const res = await fetch(url, init);
  if (!res.ok) throw new ApiError(`HTTP ${res.status} en ${url}`, res.status, await res.json().catch(() => null));
  return res.json();
};

// Lo que ya llegó del listado sirve para pintar la ficha al instante (luego se revalida).
// Los cursos privados no se guardan: su contenido depende de quién los pide (sesión y cohorte).
const courseCache = new Map();
const remember = (course) => {
  if (course?._id && course.accessMode !== 'private') courseCache.set(String(course._id), course);
  return course;
};
export const peekCourse = (id) => courseCache.get(String(id)) ?? null;

// Con sesión se manda el token: a un admin el backend le devuelve los cursos privados completos
export const fetchCourses = async (signal) => {
  const list = await getJson(`${API_URL}/api/courses`, { signal, headers: sessionHeaders() });
  if (Array.isArray(list)) list.forEach(remember);
  return list;
};

// En un curso privado el backend responde según la sesión (`access`): siempre con token si lo hay
export const fetchCourse = async (id, signal) =>
  remember(await getJson(`${API_URL}/api/courses/${id}`, { signal, headers: sessionHeaders() }));

const authHeaders = (token) => ({ Authorization: `Bearer ${token}` });
function sessionHeaders() {
  const token = readToken();
  return token ? authHeaders(token) : {};
}

// «Avísame de la próxima edición» (cursos privados). Con sesión el backend usa el email de la cuenta.
export async function registerInterest(id, email) {
  const res = await fetch(`${API_URL}/api/courses/${id}/interes`, {
    method: 'POST',
    headers: { ...sessionHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(email ? { email } : {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || `HTTP ${res.status}`, res.status, data);
  return data;
}

export const fetchEnrollmentStatus = (id, token, signal) =>
  getJson(`${API_URL}/api/users/enrollment/${id}`, { signal, headers: authHeaders(token) });

// Vídeo del curso: el backend decide si toca preview o completo según el token (si lo hay)
export const fetchCourseVideo = (id, token, signal) =>
  getJson(`${API_URL}/api/courses/${id}/video`, { signal, headers: token ? authHeaders(token) : {}, cache: 'no-store' });

export async function enrollInCourse(id, token, body) {
  const res = await fetch(`${API_URL}/api/users/enroll/${id}`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || `HTTP ${res.status}`, res.status, data);
  return data;
}

export const readToken = () => {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
};

// Áreas y niveles: una sola petición por carga, compartida entre listado, ficha y Gestión de cursos.
// Si falla, no se reintenta en cada montaje: se espera un minuto antes de volver a pedirlo.
let catalogPromise;
let catalogFailedAt = 0;
const CATALOG_RETRY_MS = 60_000;
export function fetchCatalog() {
  if (!catalogPromise && Date.now() - catalogFailedAt < CATALOG_RETRY_MS) return Promise.reject(new Error('catálogo no disponible'));
  catalogPromise ??= getJson(`${API_URL}/api/courses/areas`).catch((err) => {
    catalogPromise = undefined;
    catalogFailedAt = Date.now();
    throw err;
  });
  return catalogPromise;
}

// Progreso del alumno en cada curso con una sola petición: Map courseId → { progress, status }
export async function fetchEnrollmentMap(token, signal) {
  const { enrollments = [] } = await getJson(`${API_URL}/api/users/enrollments`, {
    signal,
    headers: authHeaders(token),
  });
  const map = new Map();
  for (const e of enrollments) {
    const id = typeof e.courseId === 'object' ? e.courseId?._id : e.courseId;
    if (id) map.set(String(id), { progress: e.progress ?? 0, status: e.status });
  }
  return map;
}

// Términos de confidencialidad: el texto vive en el backend (src/content/terms.js). Una petición por carga.
let termsPromise;
export function fetchTerms() {
  termsPromise ??= getJson(`${API_URL}/api/terms/current`).catch((err) => {
    termsPromise = undefined;
    throw err;
  });
  return termsPromise;
}

// Si el servidor dice que la versión cambió, se vuelve a pedir el texto
export const invalidateTerms = () => {
  termsPromise = undefined;
};

export const fetchTermsStatus = (courseId, token, signal) =>
  getJson(`${API_URL}/api/terms/status/${courseId}`, { signal, headers: authHeaders(token) });

export async function acceptTerms(courseId, token, termsVersion) {
  const res = await fetch(`${API_URL}/api/terms/accept/${courseId}`, {
    method: 'POST',
    headers: { ...authHeaders(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ acceptTerms: true, termsVersion }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || `HTTP ${res.status}`, res.status, data);
  return data;
}

// ============= Invitaciones a cohortes =============

// Datos de la invitación para pintar la página antes de iniciar sesión: { valid, code?, courseId, courseTitle, cohortName }
export const previewInvite = (token, signal) =>
  getJson(`${API_URL}/api/cohorts/invitations/preview?token=${encodeURIComponent(token)}`, { signal, cache: 'no-store' });

// Canje con la sesión iniciada: { status: 'joined'|'already-member', courseId } o ApiError con body.code
export async function redeemInvite(token) {
  const res = await fetch(`${API_URL}/api/cohorts/invitations/redeem`, {
    method: 'POST',
    headers: { ...sessionHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || `HTTP ${res.status}`, res.status, data);
  return data;
}
