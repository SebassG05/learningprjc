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


// ---- Cursos e inscripciones ----
export const fetchEnrollments = (courseId, signal) => request(`/api/users/admin/courses/${courseId}/enrollments`, { signal });

export const toggleCourseOpen = (courseId) => request(`/api/courses/${courseId}/toggle-open`, { method: 'PUT' });

export { request as adminRequest };

// Inscripciones de todos los cursos (pestaña Reservas): filtros, orden y paginación en servidor
export const fetchAllEnrollments = (params, signal) => request('/api/users/admin/enrollments', { params, signal });

// ---- Gestión de cursos ----
export const createCourse = (formData) => request('/api/courses', { method: 'POST', body: formData });
export const updateCourse = (id, formData) => request(`/api/courses/${id}`, { method: 'PUT', body: formData });
export const deleteCourse = (id) => request(`/api/courses/${id}`, { method: 'DELETE' });

export const addTopic = (courseId, body) => request(`/api/courses/${courseId}/temas`, { method: 'POST', body });
export const updateTopic = (courseId, topicId, body) => request(`/api/courses/${courseId}/temas/${topicId}`, { method: 'PUT', body });
export const deleteTopic = (courseId, topicId) => request(`/api/courses/${courseId}/temas/${topicId}`, { method: 'DELETE' });
export const reorderTopics = (courseId, temaIds) => request(`/api/courses/${courseId}/temas/orden`, { method: 'PUT', body: { temaIds } });

export const uploadMaterial = (courseId, topicId, formData) =>
  request(`/api/courses/${courseId}/temas/${topicId}/materiales`, { method: 'POST', body: formData });
export const deleteMaterial = (courseId, topicId, materialId) =>
  request(`/api/courses/${courseId}/temas/${topicId}/materiales/${materialId}`, { method: 'DELETE' });

// ---- Accesos: cursos privados por cohortes ----
export const setCourseAccess = (courseId, accessMode) => request(`/api/courses/${courseId}/access`, { method: 'PUT', body: { accessMode } });
export const fetchCohorts = (courseId, signal) => request('/api/cohorts', { params: { course: courseId }, signal });
export const createCohort = (body) => request('/api/cohorts', { method: 'POST', body });
export const updateCohort = (id, body) => request(`/api/cohorts/${id}`, { method: 'PUT', body });
export const deleteCohort = (id, { force = false } = {}) => request(`/api/cohorts/${id}`, { method: 'DELETE', params: force ? { force: 1 } : undefined });
export const addCohortMembers = (id, emails, sendEmail) => request(`/api/cohorts/${id}/members`, { method: 'POST', body: { emails, sendEmail } });
export const removeCohortMember = (id, memberId) => request(`/api/cohorts/${id}/members/${memberId}`, { method: 'DELETE' });
export const fetchCohortInvites = (id, signal) => request(`/api/cohorts/${id}/invites`, { signal });
// La respuesta trae `url` (con el token) una única vez: no se puede volver a consultar
export const createCohortInvite = (id, body) => request(`/api/cohorts/${id}/invites`, { method: 'POST', body });
export const revokeCohortInvite = (id, inviteId) => request(`/api/cohorts/${id}/invites/${inviteId}/revoke`, { method: 'POST' });
export const fetchCourseInterest = (courseId, signal) => request(`/api/courses/${courseId}/interes`, { signal });
