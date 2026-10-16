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
  if (!res.ok) throw new ApiError(`HTTP ${res.status} en ${url}`, res.status);
  return res.json();
};

// Lo que ya llegó del listado sirve para pintar la ficha al instante (luego se revalida)
const courseCache = new Map();
const remember = (course) => {
  if (course?._id) courseCache.set(String(course._id), course);
  return course;
};
export const peekCourse = (id) => courseCache.get(String(id)) ?? null;

export const fetchCourses = async (signal) => {
  const list = await getJson(`${API_URL}/api/courses`, { signal });
  if (Array.isArray(list)) list.forEach(remember);
  return list;
};

export const fetchCourse = async (id, signal) => remember(await getJson(`${API_URL}/api/courses/${id}`, { signal }));

const authHeaders = (token) => ({ Authorization: `Bearer ${token}` });

export const fetchEnrollmentStatus = (id, token, signal) =>
  getJson(`${API_URL}/api/users/enrollment/${id}`, { signal, headers: authHeaders(token) });

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

// Áreas y niveles: una sola petición por carga, compartida entre listado, ficha y AdminCursos.
// Si falla, se olvida la promesa para reintentar la próxima vez.
let catalogPromise;
export function fetchCatalog() {
  catalogPromise ??= getJson(`${API_URL}/api/courses/areas`).catch((err) => {
    catalogPromise = undefined;
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
