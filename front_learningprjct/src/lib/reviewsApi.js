// Cliente de la API de reseñas, compartido por la home y la página de Reseñas.

const apiUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:8547';

// Error con el detalle que devuelve el servidor: estado, mensaje y errores por campo
export class ReviewApiError extends Error {
  constructor(message, { status, fields = {}, data = {} } = {}) {
    super(message);
    this.name = 'ReviewApiError';
    this.status = status;
    this.fields = fields;
    this.data = data; // cuerpo de la respuesta (p. ej. nextReviewAt en un 429)
  }
}

async function request(path, { method = 'GET', token, body, fallback }) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${apiUrl()}/api/reviews${path}`, { method, headers, body: body && JSON.stringify(body) });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    // express-validator: [{ path: 'rating', msg: '…' }] → { rating: '…' }
    const fields = Object.fromEntries((data.errors || []).filter((e) => e.path && e.location !== 'params').map((e) => [e.path, e.msg]));
    throw new ReviewApiError(data.error || fallback, { status: res.status, fields, data });
  }
  return res.json();
}

// Con token, el servidor marca las reseñas propias (`mine: true`)
export async function fetchReviews(token) {
  const json = await request('', { token, fallback: 'Error al cargar reseñas' });
  return json.data || json;
}

// Con sesión: { canPost, nextReviewAt } (una reseña cada 24 h)
export const fetchReviewStatus = (token) => request('/status', { token, fallback: 'Error al consultar el estado' });

export const postReview = (review, token) => request('', { method: 'POST', token, body: review, fallback: 'Error al enviar reseña' });

// Solo su autor puede editarla o borrarla (el servidor lo comprueba)
export const updateReview = (id, review, token) =>
  request(`/${encodeURIComponent(id)}`, { method: 'PUT', token, body: review, fallback: 'Error al guardar los cambios' });

export const deleteReview = (id, token) =>
  request(`/${encodeURIComponent(id)}`, { method: 'DELETE', token, fallback: 'Error al borrar la reseña' });
