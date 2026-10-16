// Peticiones del catálogo de cursos.
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8547';

const getJson = async (url, init) => {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  return res.json();
};

export const fetchCourses = (signal) => getJson(`${API_URL}/api/courses`, { signal });

export const fetchCourse = (id, signal) => getJson(`${API_URL}/api/courses/${id}`, { signal });

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
    headers: { Authorization: `Bearer ${token}` },
  });
  const map = new Map();
  for (const e of enrollments) {
    const id = typeof e.courseId === 'object' ? e.courseId?._id : e.courseId;
    if (id) map.set(String(id), { progress: e.progress ?? 0, status: e.status });
  }
  return map;
}
