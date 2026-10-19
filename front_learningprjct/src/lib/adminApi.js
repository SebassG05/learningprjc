// Peticiones del panel de administración (correcciones, reservas, progreso y gestión de cursos).
// Los componentes nunca llaman a fetch: usan estos servicios a través de sus hooks.
import { API_URL, ApiError, fetchCourses, readToken } from './coursesApi';

export { ApiError, fetchCourses };

const query = (params = {}) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : '';
};

// Petición autenticada con el token de la sesión. El error lleva el mensaje del backend si lo hay.
async function request(path, { method = 'GET', body, params, signal, keepalive = false } = {}) {
  const headers = { Authorization: `Bearer ${readToken() ?? ''}` };
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${API_URL}${path}${query(params)}`, {
    method,
    headers,
    signal,
    keepalive,
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || data.mensaje || `HTTP ${res.status}`, res.status, data);
  return data;
}

// ---- Entregas ----
export const fetchSubmissions = (params, signal) => request('/api/entregas/admin/todas', { params, signal });

// `keepalive` permite que la corrección diferida llegue al servidor aunque se cierre la pestaña
export const gradeSubmission = (id, body, { keepalive = false } = {}) =>
  request(`/api/entregas/${id}/corregir`, { method: 'PUT', body, keepalive });

export const submissionFileUrl = (entrega) => (entrega?.archivoPdf?.url ? `${API_URL}${entrega.archivoPdf.url}` : null);

// ---- Cursos e inscripciones ----
export const fetchEnrollments = (courseId, signal) => request(`/api/users/admin/courses/${courseId}/enrollments`, { signal });

export const toggleCourseOpen = (courseId) => request(`/api/courses/${courseId}/toggle-open`, { method: 'PUT' });

export { request as adminRequest };
