// Peticiones de las dudas por tema. Los componentes usan estos servicios a través de sus hooks.
import { API_URL, ApiError, readToken } from './coursesApi';

const query = (params = {}) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.set(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : '';
};

// Con sesión añade el token; sin ella la petición va anónima (el listado es de auth opcional)
async function request(path, { method = 'GET', body, params, signal } = {}) {
  const headers = {};
  const token = readToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${API_URL}${path}${query(params)}`, {
    method,
    headers,
    signal,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || data.mensaje || `HTTP ${res.status}`, res.status, data);
  return data;
}

export { ApiError };

export const fetchDudas = (cursoId, { temaId, estado } = {}, signal) =>
  request(`/api/courses/${cursoId}/dudas`, { params: { temaId, estado }, signal });
export const createDuda = (cursoId, body) => request(`/api/courses/${cursoId}/dudas`, { method: 'POST', body });
export const updateDuda = (id, body) => request(`/api/dudas/${id}`, { method: 'PATCH', body });
export const deleteDuda = (id) => request(`/api/dudas/${id}`, { method: 'DELETE' });

export const addRespuesta = (id, texto) => request(`/api/dudas/${id}/respuestas`, { method: 'POST', body: { texto } });
export const updateRespuesta = (id, respuestaId, texto) =>
  request(`/api/dudas/${id}/respuestas/${respuestaId}`, { method: 'PATCH', body: { texto } });
export const deleteRespuesta = (id, respuestaId) => request(`/api/dudas/${id}/respuestas/${respuestaId}`, { method: 'DELETE' });

// accion: resolver | reabrir | fijar | desfijar | ocultar | mostrar (`respuestaId` para actuar sobre una respuesta)
export const setEstado = (id, accion, respuestaId) =>
  request(`/api/dudas/${id}/estado`, { method: 'PATCH', body: respuestaId ? { accion, respuestaId } : { accion } });
export const marcarVista = (id) => request(`/api/dudas/${id}/vista`, { method: 'POST' });
export const reportar = (id, motivo) => request(`/api/dudas/${id}/reportar`, { method: 'POST', body: { motivo } });

// ---- Profesores ----
export const fetchMisDudasProfesor = (signal) => request('/api/profesor/dudas', { signal });
export const fetchMisCursosProfesor = (signal) => request('/api/profesor/cursos', { signal });
// El token de la invitación viaja en el cuerpo, nunca en la URL
export const previewTeacherInvite = (token, signal) =>
  request('/api/profesor/invitacion/vista', { method: 'POST', body: { token }, signal });
export const redeemTeacherInvite = (token) => request('/api/profesor/invitacion/canjear', { method: 'POST', body: { token } });
